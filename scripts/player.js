class Player {
  constructor(col, row) {
    // タイル座標
    this.col = col;
    this.row = row;
    // ピクセル座標 (タイルの中心に合わせる)
    this.x = col * 32 + 16;
    this.y = row * 32 + 16;

    this.speed = 200;      // 移動速度 (ピクセル/秒)
    this.width = 24;
    this.height = 24;

    // ライフ制 (元のコード)
    this.life = 3;
    this.invincibleTimer = 0;

    // パワーアップ関連 (元のコード)
    this.powerTimer       = 0;
    this.powerKillEnabled = false;
    this.failCount        = 0;
    this.failTimer        = 0;

    // ▼--- タイル移動用の変数 ---▼
    // 現在向いている方向 ("left","right","up","down" or null)
    this.direction = null;
    // 次のタイル中心 (移動先ターゲット座標)
    this.targetX = this.x;
    this.targetY = this.y;
  }

  update(dt, engine) {
    // ==========================
    // (1) 各種タイマー処理
    // ==========================
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer < 0) this.invincibleTimer = 0;
    }
    if (this.powerTimer > 0) {
      this.powerTimer -= dt;
      if (this.powerTimer <= 0) {
        this.endPower(engine);
      }
    }
    if (this.failTimer > 0) {
      this.failTimer -= dt;
      if (this.failTimer <= 0) {
        this.endPower(engine);
      }
    }

    // ==========================
    // (2) タイル中心への移動
    // ==========================
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distRemain = Math.hypot(dx, dy);

    if (distRemain > 1) {
      // --------- まだターゲットに到達していない(移動中) ---------
      // 途中で「真逆の入力」があれば反転
      const opp = this.checkOppositeDirection(engine);
      if (opp) {
        // 反転 (途中でも引き返す)
        this.reverseDirection(opp, engine);
      }

      // 反転しなかった → そのまま移動
      const moveDist = this.speed * dt;
      const ux = dx / distRemain;
      const uy = dy / distRemain;
      if (moveDist >= distRemain) {
        // 一気に到着
        this.x = this.targetX;
        this.y = this.targetY;
      } else {
        // 途中まで進む
        this.x += ux * moveDist;
        this.y += uy * moveDist;
      }
    } else {
      // --------- ターゲット中心に到着した ---------
      this.x = this.targetX;
      this.y = this.targetY;

      // タイル座標を再計算 (x-16, y-16 は「タイル左上」基準に戻している)
      this.col = Math.floor((this.x - 16) / 32);
      this.row = Math.floor((this.y - 16) / 32);

      // ユーザー入力された新方向を取得
      const newDir = this.getInputDirection(engine);
      if (newDir) {
        // (A) 新方向が壁でなければ方向転換
        if (!this.isWallNextTile(newDir, engine)) {
          this.direction = newDir;
          this.setTargetByDirection(newDir);
        } else {
          // (B) 壁 → 転換不可 → そのまま方向を維持できるか？
          if (this.direction && !this.isWallNextTile(this.direction, engine)) {
            // 前進可能なら今の方向を続行
            this.setTargetByDirection(this.direction);
          } else {
            // 前方も壁なら停止
            this.direction = null;
            this.targetX = this.x;
            this.targetY = this.y;
          }
        }
      } else {
        // (C) 入力なし → 今の方向で進めるか？
        if (this.direction && !this.isWallNextTile(this.direction, engine)) {
          // 壁でなければ継続
          this.setTargetByDirection(this.direction);
        } else {
          // 壁なら停止
          this.direction = null;
          this.targetX = this.x;
          this.targetY = this.y;
        }
      }
    }

    // ==========================
    // (3) 衝突判定 (ドット, 敵, etc.)
    // ==========================
    for (const obj of engine.objects) {
      if (obj === this) continue;

      // ドット
      if (obj instanceof Dot && !obj.dead) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y);
        if (dist < 16) {
          obj.dead = true;
          engine.objects = engine.objects.filter(o => o !== obj);
          engine.score += obj.scoreValue;

          // パワーアップ中は failCount リセット
          if (this.powerKillEnabled) {
            this.failCount = 0;
            this.failTimer = 0;
          }
        }
      }
      // すべてのドットが消えたら次ステージへ
      const anyDot = engine.objects.some(o => o instanceof Dot && !o.dead);
      if (!anyDot) {
        nextStage();
        return;
      }

      // 巻物
      if (obj instanceof Scroll && !obj.dead) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y);
        if (dist < 16) {
          obj.dead = true;
          engine.objects = engine.objects.filter(o => o !== obj);
          this.startPower(engine);
        }
      }

      // 敵
      if (obj instanceof Enemy && !obj.dead) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y);
        if (dist < 20) {
          if (this.powerKillEnabled) {
            // 敵を倒す
            obj.dead = true;
            engine.objects = engine.objects.filter(o => o !== obj);
            engine.score += 200;
          } else {
            // ダメージ
            if (this.invincibleTimer <= 0) {
              this.life--;
              engine.playerLife = this.life; 
              if (this.life <= 0) {
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

  // ==========================
  // (4) パワーアップ関連 (元のコードのまま)
  // ==========================
  startPower(engine) {
    this.powerTimer = 3;  // 3秒間など
    this.powerKillEnabled = true;
    this.failCount = 0;
    this.failTimer = 0;

    for (const obj of engine.objects) {
      if (obj instanceof Enemy) {
        obj.isEscaping = true;
      }
    }
  }

  endPower(engine) {
    this.powerKillEnabled = false;
    this.failCount = 0;
    this.failTimer = 0;
    this.powerTimer = 0;

    for (const obj of engine.objects) {
      if (obj instanceof Enemy) {
        obj.isEscaping = false;
      }
    }
  }

  // ==========================
  // (5) 移動ヘルパー
  // ==========================

  // ユーザー入力を方向に変換
  getInputDirection(engine) {
    if (engine.keys["ArrowLeft"]  || engine.keys["KeyA"])  return "left";
    if (engine.keys["ArrowRight"] || engine.keys["KeyD"])  return "right";
    if (engine.keys["ArrowUp"]    || engine.keys["KeyW"])  return "up";
    if (engine.keys["ArrowDown"]  || engine.keys["KeyS"])  return "down";
    return null;
  }

  // タイル移動のターゲットを1マス先に
  setTargetByDirection(dir) {
    let dc=0, dr=0;
    if (dir==="left")  dc = -1;
    if (dir==="right") dc =  1;
    if (dir==="up")    dr = -1;
    if (dir==="down")  dr =  1;

    const newCol = this.col + dc;
    const newRow = this.row + dr;
    this.targetX = newCol * 32 + 16;
    this.targetY = newRow * 32 + 16;
  }

  // 真逆の方向キーで途中反転(移動中でも即切り返す)
  checkOppositeDirection(engine) {
    if (this.direction==="left"  && (engine.keys["ArrowRight"]||engine.keys["KeyD"])) return "right";
    if (this.direction==="right" && (engine.keys["ArrowLeft"] ||engine.keys["KeyA"])) return "left";
    if (this.direction==="up"    && (engine.keys["ArrowDown"] ||engine.keys["KeyS"])) return "down";
    if (this.direction==="down"  && (engine.keys["ArrowUp"]   ||engine.keys["KeyW"])) return "up";
    return null;
  }

  reverseDirection(newDir, engine) {
    // いまのタイル座標を再計算 & 位置合わせ
    const curCol = Math.floor((this.x - 16) / 32);
    const curRow = Math.floor((this.y - 16) / 32);
    this.x = curCol * 32 + 16;
    this.y = curRow * 32 + 16;
    this.col = curCol;
    this.row = curRow;

    // 反転先が壁でなければ進む
    if (!this.isWallNextTile(newDir, engine)) {
      this.direction = newDir;
      this.setTargetByDirection(newDir);
    } else {
      // 壁なら停止
      this.direction = null;
      this.targetX = this.x;
      this.targetY = this.y;
    }
  }

  // 次タイルが壁かどうか
  isWallNextTile(dir, engine) {
    let dc=0, dr=0;
    if (dir==="left")  dc=-1;
    if (dir==="right") dc= 1;
    if (dir==="up")    dr=-1;
    if (dir==="down")  dr= 1;

    const newCol = this.col + dc;
    const newRow = this.row + dr;
    const tx = newCol * 32 + 16;
    const ty = newRow * 32 + 16;
    return engine.gameMap.isWall(tx, ty);
  }

  // ==========================
  // (6) 描画
  // ==========================
  draw(ctx, engine) {
    const img = engine.images["player"];
    if (img) {
      ctx.drawImage(img, this.x - 16, this.y - 16, 32,32);
    } else {
      ctx.fillStyle="lime";
      ctx.fillRect(this.x-8, this.y-8, 16,16);
    }
  }
}
