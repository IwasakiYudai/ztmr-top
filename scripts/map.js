// map.js
// 簡単なパックマンのマップを文字列配列で管理し、壁やペレットをEngineに追加する

class GameMap {
  constructor() {
    // パックマンマップ例 (同じもの)
    this.data = [
      "===================",
      "=.....E.....P.....=",
      "=.==.==.==.==.==.==",
      "=..........E......=",
      "=.==.==.==.==.==.==",
      "=.................=",
      "=.==.==.==.==.==.==",
      "=.................=",
      "=.==.==.==.==.==.==",
      "=.................=",
      "=.==.==.==.==.==.==",
      "=.................=",
      "=.==.==.==.==.==.==",
      "=.................=",
      "===================",
    ];
    this.tileSize = 32;
    this.width = this.data[0].length;
    this.height = this.data.length;
  }

  init(engine) {
    // engine.images["wall"], ["pellet"] などを使う想定
    // 文字を解析してオブジェクトを追加
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        const c = this.data[row][col];
        if (c === "=") {
          // 壁
          engine.addObject(new Wall(col, row));
        } else if (c === ".") {
          // ペレット
          engine.addObject(new Pellet(col, row));
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

  // あとで衝突判定に使うなど
  isWall(x, y) {
    // タイル座標に変換
    const col = Math.floor(x / this.tileSize);
    const row = Math.floor(y / this.tileSize);
    if (row < 0 || row >= this.height || col < 0 || col >= this.width) {
      return true; // 壁扱い(外)
    }
    return this.data[row][col] === "=";
  }
}

// 壁, ペレットなどもクラスにまとめる

class Wall {
  constructor(col, row) {
    this.x = col * 32;
    this.y = row * 32;
    this.width = 32;
    this.height = 32;
  }
  update(dt, engine) {
    // 壁は動かない
  }
  draw(ctx, engine) {
    const img = engine.images["wall"];
    if (img) {
      // ★ ここを修正: drawImage(img, x, y, 32, 32) で 32×32に縮小描画
      ctx.drawImage(img, this.x, this.y, 32, 32);
    } else {
      // フォールバック: 青い四角
      ctx.fillStyle = "blue";
      ctx.fillRect(this.x, this.y, 32, 32);
    }
  }
}

class Pellet {
  constructor(col, row) {
    this.x = col * 32 + 12;
    this.y = row * 32 + 12;
    this.radius = 4;
    this.dead = false; // 破壊フラグ
  }
  update(dt, engine) {
    // 当たり判定はplayer側が見る or ここで見るかは設計次第
  }
  draw(ctx, engine) {
    const img = engine.images["pellet"];
    if (img) {
      // 小さい画像ならdrawImageでもいいし、円を描いてもいい
      ctx.drawImage(img, this.x - 16, this.y - 16, 32, 32);
    } else {
      // 画像ないなら円で描画
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
