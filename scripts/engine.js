// engine.js
// ここではメインループ、画像読み込み、オブジェクト管理をまとめる

class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.objects = [];      // ゲームオブジェクト (player, enemy, pellet など)
    this.keys = {};         // キー入力の状態
    this.images = {};       // 読み込んだ画像を保持
    this.lastTime = 0;      // 前フレームの時刻
    this.running = false;

    // キーボードイベント
    window.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });
  }

  // 画像をプリロードするメソッド
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

  // 全画像をまとめて読み込む
  async loadAssets() {
    const promises = [];
    promises.push(this.loadImage("wall",   "img/wall.png"));
    promises.push(this.loadImage("player", "img/ahuro.png"));
    promises.push(this.loadImage("enemy",  "img/naga.png"));
    promises.push(this.loadImage("pellet", "img/scroll.png"));
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

  loop(currentTime) {
    if (!this.running) return;

    const dt = (currentTime - this.lastTime) / 1000; // 秒
    this.lastTime = currentTime;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    // 全オブジェクト更新
    for (const obj of this.objects) {
      if (obj.update) {
        obj.update(dt, this);
      }
    }
  }

  draw() {
    // 画面クリア
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 全オブジェクト描画
    for (const obj of this.objects) {
      if (obj.draw) {
        obj.draw(this.ctx, this);
      }
    }
  }
}
