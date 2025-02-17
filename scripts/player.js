// player.js

class Player {
  constructor(col, row) {
    this.x = col * 32;
    this.y = row * 32;
    this.width = 24;
    this.height = 24;
    this.speed = 100;

    // ▼ ライフと無敵タイマーの追加
    this.life = 3;           // ライフ3
    this.invincibleTimer = 0; // ダメージ直後の無敵時間(秒)
  }

  update(dt, engine) {
    // 毎フレーム無敵タイマーを減らす
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer < 0) {
        this.invincibleTimer = 0;
      }
    }

    // 移動ベクトル初期化
    let vx = 0;
    let vy = 0;
    if (engine.keys["ArrowLeft"]  || engine.keys["KeyA"]) vx = -this.speed;
    if (engine.keys["ArrowRight"] || engine.keys["KeyD"]) vx =  this.speed;
    if (engine.keys["ArrowUp"]    || engine.keys["KeyW"]) vy = -this.speed;
    if (engine.keys["ArrowDown"]  || engine.keys["KeyS"]) vy =  this.speed;

    // 壁衝突チェック
    const oldX = this.x;
    const oldY = this.y;
    this.x += vx * dt;
    this.y += vy * dt;
    if (engine.gameMap.isWall(this.x, this.y)) {
      this.x = oldX;
      this.y = oldY;
    }

    // オブジェクト衝突
    for (const obj of engine.objects) {
      // ▼ ペレット衝突：スコア+10
      if (obj instanceof Pellet && !obj.dead) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y);
        if (dist < 16) {
          obj.dead = true; // ペレットを破壊
          engine.objects = engine.objects.filter(o => o !== obj);
          engine.score += 10; // スコア +10
        }
      }

      // ▼ 敵衝突：ライフを1減らす (無敵でなければ)
      if (obj instanceof Enemy) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y);
        if (dist < 20) {
          // 敵に当たったら
          if (this.invincibleTimer <= 0) {
            // まだ無敵じゃない場合
            this.life -= 1;
            if (this.life <= 0) {
              // ライフが尽きたらゲームオーバー
              engine.gameOver();
            } else {
              // ライフを1減らして3秒無敵
              this.invincibleTimer = 3;
            }
          }
        }
      }
    }
  }

  draw(ctx, engine) {
    // プレイヤー画像 or 四角
    const img = engine.images["player"];
    if (img) {
      ctx.drawImage(img, this.x - 16, this.y - 16, 32, 32);
    } else {
      ctx.fillStyle = "lime";
      ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
    }

    // ▼ 無敵中は点滅など演出したければここで(省略)
  }
}
