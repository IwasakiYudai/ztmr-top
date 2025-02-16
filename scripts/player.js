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
    this.score = 0;
  }

  update(dt, engine) {
    // キー入力
    this.vx = 0;
    this.vy = 0;
    if (engine.keys["ArrowLeft"])  this.vx = -this.speed;
    if (engine.keys["ArrowRight"]) this.vx =  this.speed;
    if (engine.keys["ArrowUp"])    this.vy = -this.speed;
    if (engine.keys["ArrowDown"])  this.vy =  this.speed;

    // 移動
    const oldX = this.x;
    const oldY = this.y;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 簡易壁衝突( map is global or pass from engine?)
    // 例: if engine.map.isWall(this.x, this.y) then revert
    // ただし、メトロイドヴァニアのようなAABB衝突はもう少し複雑
    // ここでは簡略:
    if (engine.gameMap.isWall(this.x, this.y)) {
      this.x = oldX;
      this.y = oldY;
    }

    // ペレット衝突判定
    for (const obj of engine.objects) {
      if (obj instanceof Pellet) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y);
        if (dist < 16) {
          // 破壊
          obj.dead = true;
          engine.objects = engine.objects.filter(o => o !== obj);
          this.score++;
        }
      }
    }
    // 敵衝突
    for (const obj of engine.objects) {
      if (obj instanceof Enemy) {
        const dist = Math.hypot(this.x - obj.x, this.y - obj.y);
        if (dist < 20) {
          // ゲームオーバー
          // ここでは main.js 側でシーン管理
        }
      }
    }
  }

  draw(ctx, engine) {
    const img = engine.images["player"];
    if (img) {
      ctx.drawImage(img, this.x - 16, this.y - 16, 32, 32);
    } else {
      // 画像が無い時の代わり
      ctx.fillStyle = "lime";
      ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
    }
  }
}
