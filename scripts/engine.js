// engine.js

class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.objects = [];
    this.keys = {};
    this.images = {};
    this.lastTime = 0;
    this.running = false;

    // ▼ 追加(既存) ▼
    this.score = 0;         // 現在の得点
    this._survivalAcc = 0;  // 生存時間で加点用

    // ゲームオーバーのコールバック
    this.onGameOverCallback = null;

    // キーボードイベント + 矢印キー等でスクロールしない
    window.addEventListener("keydown", (e) => {
      const preventList = [
        "ArrowUp","ArrowDown","ArrowLeft","ArrowRight",
        "KeyW","KeyA","KeyS","KeyD",
      ];
      if (preventList.includes(e.code)) {
        e.preventDefault();
      }
      this.keys[e.code] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  // 画像読み込み
  loadImage(name, src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.images[name] = img;
        resolve();
      };
    });
  }

  // 必要な画像を全て読み込む
  async loadAssets() {
    const promises = [];
    promises.push(this.loadImage("wall",   "img/wall.png"));
    promises.push(this.loadImage("player", "img/ahuro.png"));
    promises.push(this.loadImage("enemy",  "img/naga.png"));
    promises.push(this.loadImage("scroll", "img/scroll.png"));  // 巻物

    await Promise.all(promises);
  }

  addObject(obj) {
    this.objects.push(obj);
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  stop() {
    this.running = false;
  }

  // ゲームオーバー
  gameOver() {
    this.stop();
    if (this.onGameOverCallback) {
      this.onGameOverCallback(this.score);
    }
  }

  loop(currentTime) {
    if (!this.running) return;

    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // 5秒ごとに+1点
    this._survivalAcc += dt;
    while (this._survivalAcc >= 5) {
      this.score += 1;
      this._survivalAcc -= 5;
    }

    // 全オブジェクト更新
    for (const obj of this.objects) {
      if (obj.update) {
        obj.update(dt, this);
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 全オブジェクト描画
    for (const obj of this.objects) {
      if (obj.draw) {
        obj.draw(this.ctx, this);
      }
    }

    // スコア表示 / プレイヤーライフなど
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "20px sans-serif";

    const player = this.objects.find(o => o instanceof Player);
    if (player) {
      // ライフ と スコア
      this.ctx.fillText(`Score: ${this.score}   Life: ${player.life}`, 10, 30);
    } else {
      // プレイヤーいないときスコアのみ
      this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }
  }
}
