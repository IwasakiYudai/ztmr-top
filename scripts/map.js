// map.js

class GameMap {
  constructor() {
    this.data = [
      "====================",
      "=E................E=",
      "=.===.=.======.===.=",
      "=..S..=......=..S..=",
      "=.===.=.====.=.===.=",
      "=.....=......=.....=",
      "=.===.======.=.===.=",
      "..........P.........",
      "===.===.====.===.===",
      "===...=......=...===",
      "===.=.=.====.=.=.===",
      "=S..=..........=..S=",
      "=.=====.====.=====.=",
      "=E................E=",
      "====================",
    ];
    this.tileSize = 32;
    this.width = this.data[0].length;
    this.height = this.data.length;
  }

  init(engine) {
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const c = this.data[row][col];
        if (c === "=") {
          engine.addObject(new Wall(col, row));
        } else if (c === ".") {
          // ドット(10点)
          engine.addObject(new Dot(col, row));
        } else if (c === "S") {
          // 巻物 (パワーアップ)
          engine.addObject(new Scroll(col, row));
        } else if (c === "P") {
          // プレイヤー
          engine.addObject(new Player(col, row));
        } else if (c === "E") {
          // 敵
          engine.addObject(new Enemy(col, row));
        }
      }
    }
  }

  isWall(x, y) {
    const col = Math.floor(x / this.tileSize);
    const row = Math.floor(y / this.tileSize);
    if (row<0 || row>=this.height || col<0 || col>=this.width) {
      return true;
    }
    return this.data[row][col] === "=";
  }
}

// 壁
class Wall {
  constructor(col, row) {
    this.x = col * 32;
    this.y = row * 32;
  }
  update(dt, engine) {}
  draw(ctx, engine) {
    const wimg = engine.images["wall"];
    if (wimg) {
      ctx.drawImage(wimg, this.x, this.y, 32, 32);
    } else {
      ctx.fillStyle = "blue";
      ctx.fillRect(this.x, this.y, 32, 32);
    }
  }
}

// ▼ ドット(10点)
class Dot {
  constructor(col, row) {
    this.x = col * 32 + 16;
    this.y = row * 32 + 16;
    this.dead = false;
    this.scoreValue = 10;
  }
  update(dt, engine) {}
  draw(ctx, engine) {
    const dotImg = engine.images["dot"];
    if (dotImg) {
      ctx.drawImage(dotImg, this.x - 4, this.y - 4, 8, 8);
    } else {
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(this.x, this.y, 4, 0, Math.PI*2);
      ctx.fill();
    }
  }
}

// ▼ 巻物(パワーアップ用)
class Scroll {
  constructor(col, row) {
    this.x = col*32 + 16;
    this.y = row*32 + 16;
    this.dead = false;
  }
  update(dt, engine) {}
  draw(ctx, engine) {
    const sImg = engine.images["scroll"];
    if (sImg) {
      ctx.drawImage(sImg, this.x - 16, this.y - 16, 32, 32);
    } else {
      ctx.fillStyle = "orange";
      ctx.fillRect(this.x-8, this.y-8, 16,16);
    }
  }
}
