// player.js

class Player {
  constructor(col, row) {
    this.x = col * 32;
    this.y = row * 32;
    this.width = 24;
    this.height = 24;
    this.speed = 100;
    this.vx = 0;
    this.vy = 0;
    // this.score はもう使わず, Engine側にscoreを置く
  }

  update(dt, engine) {
    this.vx = 0;
    this.vy = 0;
    if (engine.keys["ArrowLeft"]  || engine.keys["KeyA"]) this.vx = -this.speed;
    if (engine.keys["ArrowRight"] || engine.keys["KeyD"]) this.vx =  this.speed;
    if (engine.keys["ArrowUp"]    || engine.keys["KeyW"]) this.vy = -this.speed;
    if (engine.keys["ArrowDown"]  || engine.keys["KeyS"]) this.vy =  this.speed;

    const oldX = this.x;
    const oldY = this.y;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 壁判定
    if (engine.gameMap.isWall(this.x, this.y)) {
      this.x = oldX;
      this.y = oldY;
    }

    // オブジェクト衝突
    for (const obj of engine.objects) {
      // ペレット衝突 -> +10点
      if (obj instanceof Pellet && !obj.dead) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y);
        if (dist < 16) {
          obj.dead = true; // 破壊
          engine.objects = engine.objects.filter(o => o !== obj);
          engine.score += 10; // ★ 10点追加
        }
      }

      // 敵衝突 -> ゲームオーバー
      if (obj instanceof Enemy) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y);
        if (dist < 20) {
          // ★ ゲームオーバーを発動
          engine.gameOver();
        }
      }
    }
  }

  draw(ctx, engine) {
    const img = engine.images["player"];
    if (img) {
      ctx.drawImage(img, this.x - 16, this.y - 16, 32, 32);
    } else {
      ctx.fillStyle = "lime";
      ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
    }
  }
}
