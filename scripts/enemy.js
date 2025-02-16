// enemy.js

class Enemy {
  constructor(col, row) {
    this.x = col * 32;
    this.y = row * 32;
    this.width = 24;
    this.height = 24;
    this.speed = 40;
  }

  update(dt, engine) {
    // 簡易AI: プレイヤーを探して追う
    const player = engine.objects.find(o => o instanceof Player);
    if (player) {
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const mag = Math.hypot(dx, dy);
      if (mag > 1) {
        // 単位ベクトル
        const ux = dx / mag;
        const uy = dy / mag;
        this.x += ux * this.speed * dt;
        this.y += uy * this.speed * dt;

        // 壁衝突などは同様に check ...
        if (engine.gameMap.isWall(this.x, this.y)) {
          // 壁に当たったらちょっと戻す or 方向変える
        }
      }
    }
  }

  draw(ctx, engine) {
    const img = engine.images["enemy"];
    if (img) {
      ctx.drawImage(img, this.x - 16, this.y - 16, 32, 32);
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
    }
  }
}
