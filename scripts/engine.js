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

    // ▼ 追加 ▼
    this.score = 0;             // 現在の得点
    this._survivalAcc = 0;      // 生存時間を計測し、5秒ごと+1点

    // ゲームオーバー時に呼び出すコールバック (main.jsで設定予定)
    this.onGameOverCallback = null;

    // キーボードイベント
    window.addEventListener("keydown", (e) => {
      // 矢印キーなどのスクロールを防止
      const preventList = [
        "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
        "KeyW", "KeyA", "KeyS", "KeyD",
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

  // ▼ ゲームオーバーを発動するメソッド ▼
  gameOver() {
    this.stop();  // ループ停止
    if (this.onGameOverCallback) {
      // コールバックが登録されていれば呼ぶ (得点表示など)
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
    // 5秒ごとに +1点
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

// engine.js の draw() を変更

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 全オブジェクトの描画
    for (const obj of this.objects) {
      if (obj.draw) {
        obj.draw(this.ctx, this);
      }
    }

    // スコア表示
    this.ctx.fillStyle = "#fff";
    this.ctx.font = "20px sans-serif";

    // ▼ プレイヤーライフ表示
    const player = this.objects.find(o => o instanceof Player);
    if (player) {
      this.ctx.fillText(`Score: ${this.score}   Life: ${player.life}`, 10, 30);
    } else {
  // プレイヤーが存在しない(まだ生成されてない)場合はスコアのみ
      this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    }
  }

}
