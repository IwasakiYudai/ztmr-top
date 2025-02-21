// player.js

class Player {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.x = col * 32;
    this.y = row * 32;
    this.speed = 200;
    this.width = 24;
    this.height = 24;

    // ライフ制
    this.life = 3;
    this.invincibleTimer = 0;

    // パワーアップ関連
    this.powerTimer = 0;           // 巻物を取ると一定時間カウント
    this.powerKillEnabled = false; // 敵を倒せるか
    this.failCount = 0;            // ドットを取り損ねた回数
    this.failTimer = 0;            // 2秒後にパワー解除するため
  }

  update(dt, engine) {

    // ▼=== (1) タイマー関連の処理 ===
    // 無敵タイマー(ダメージ直後)
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer < 0) this.invincibleTimer = 0;
    }

    // パワータイマー（巻物取得で発動、切れたらパワー解除）
    if (this.powerTimer > 0) {
      this.powerTimer -= dt;
      if (this.powerTimer <= 0) {
        // 時間切れ → パワー解除
        this.endPower(engine);
      }
    }

    // failTimer（ドット取り損ね２回 → 2秒後にパワー解除）
    if (this.failTimer > 0) {
      this.failTimer -= dt;
      if (this.failTimer <= 0) {
        // 2秒経過 → パワー解除
        this.endPower(engine);
      }
    }

    // ▼=== (2) 移動処理(上下左右のどれか) ===
    let dir = null;
    if (engine.keys["ArrowLeft"]  || engine.keys["KeyA"])  dir = "left";
    else if (engine.keys["ArrowRight"] || engine.keys["KeyD"]) dir = "right";
    else if (engine.keys["ArrowUp"]    || engine.keys["KeyW"]) dir = "up";
    else if (engine.keys["ArrowDown"]  || engine.keys["KeyS"]) dir = "down";

    let moveX=0, moveY=0;
    const spd = this.speed * dt;
    if(dir==="left")  moveX = -spd;
    if(dir==="right") moveX =  spd;
    if(dir==="up")    moveY = -spd;
    if(dir==="down")  moveY =  spd;

    const oldX = this.x;
    const oldY = this.y;
    this.x += moveX;
    this.y += moveY;

    // 壁衝突 → 戻す
    if(engine.gameMap.isWall(this.x, this.y)){
      this.x = oldX;
      this.y = oldY;

      // パワー中かつ壁で方向転換 → ドット取り損ね?
      if(this.powerKillEnabled){
        this.failCount++;
        if(this.failCount >= 1){
          // 2回 → failTimer=2秒後に解除
          if(this.failTimer<=0){
            this.failTimer = 1;
          }
        }
      }

    } else {
      // タイル座標更新
      this.col = Math.floor(this.x/32);
      this.row = Math.floor(this.y/32);
    }

    // ▼=== (3) オブジェクト衝突判定 ===
    for(const obj of engine.objects){
      if(obj===this) continue;

      // ドット
      if(obj instanceof Dot && !obj.dead){
        const dist = Math.hypot(this.x-obj.x, this.y-obj.y);
        if(dist<16){
          obj.dead = true;
          engine.objects = engine.objects.filter(o=>o!==obj);
          engine.score += obj.scoreValue;

          // ドット取得 → 取り損ね回数リセット
          if(this.powerKillEnabled){
            this.failCount=0;
            this.failTimer=0;
          }
        }
      }
      const anyDot = engine.objects.some(o => o instanceof Dot && !o.dead);
      if(!anyDot){
      // すべてのDotが無い → 次のステージ
      nextStage();  // main.jsに定義した関数
      return; 
      }

      // 巻物(Scroll)
      if(obj instanceof Scroll && !obj.dead){
        const dist=Math.hypot(this.x-obj.x, this.y-obj.y);
        if(dist<16){
          obj.dead=true;
          engine.objects=engine.objects.filter(o=>o!==obj);
          // パワー開始
          this.startPower(engine);
        }
      }

      // 敵(Enemy)
      if(obj instanceof Enemy && !obj.dead){
        const dist=Math.hypot(this.x-obj.x, this.y-obj.y);
        if(dist<20){
          if(this.powerKillEnabled){
            // 敵倒す
            obj.dead=true;
            engine.objects=engine.objects.filter(o=>o!==obj);
            engine.score+=200;
          } else {
            // ダメージ
            if(this.invincibleTimer<=0){
              this.life--;
              engine.playerLife = this.life;  // ★ エンジンにも反映
              if(this.life<=0){
                engine.gameOver();
              } else {
                stageResetButKeepScore();
                return;
              }
            }
          }
        }
      }
    }
  }

  // ▼=== (4) パワー開始 ===
  startPower(engine){
    this.powerTimer=3;          // 5秒
    this.powerKillEnabled=true; 
    this.failCount=0;
    this.failTimer=0;

    // 全ての敵を逃走状態にする
    for(const obj of engine.objects){
      if(obj instanceof Enemy){
        obj.isEscaping=true;
      }
    }
  }

  // ▼=== (5) パワー終了 ===
  endPower(engine){
    this.powerKillEnabled=false;
    this.failCount=0;
    this.failTimer=0;
    this.powerTimer=0;

    // 敵の逃走を解除
    for(const obj of engine.objects){
      if(obj instanceof Enemy){
        obj.isEscaping=false;
      }
    }
  }

  draw(ctx, engine) {
    const img=engine.images["player"];
    if(img){
      ctx.drawImage(img, this.x-16, this.y-16, 32,32);
    } else {
      ctx.fillStyle="lime";
      ctx.fillRect(this.x-8, this.y-8, 16,16);
    }
  }
}
