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
    this.playerLife = 3;

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
    this.enableMobileControls();
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
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

    for(const obj of this.objects){
      if(obj.draw){
        obj.draw(this.ctx, this);
      }
    }

    // スコア + ライフ表示
    const player = this.objects.find(o => o instanceof Player);
    let showLife = this.playerLife;
    if(player){
      // 念のためプレイヤーにも life がある
      showLife = player.life;
    }

    this.ctx.fillStyle="#fff";
    this.ctx.font="20px sans-serif";
    this.ctx.fillText(`Score: ${this.score}   Life: ${showLife}`, 10,30);
  }

  
   enableMobileControls() {
    // ----------------------------
    // 1) 仮想スティック
    // ----------------------------
    const stickArea = document.getElementById("virtualStickArea");
    if (stickArea) {
      // スティックの中心
      let baseX = 0;
      let baseY = 0;
      let active = false;

      const handleTouchMove = (touch) => {
        const rect = stickArea.getBoundingClientRect();
        // 要素左上を(0,0)に
        const rx = touch.clientX - rect.left;
        const ry = touch.clientY - rect.top;

        // 中心座標(半径60pxの円) → (rect.width/2, rect.height/2)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // ベクトル
        const dx = rx - centerX;
        const dy = ry - centerY;

        // スティックをある程度閾値(10pxなど)を超えたら方向判定
        const deadZone = 10;
        const dist = Math.hypot(dx, dy);
        let vx = 0, vy = 0;
        if (dist > deadZone) {
          // 単位ベクトル
          vx = dx / dist;
          vy = dy / dist;
        }

        // ここで vx, vy の方向を矢印キーに変換
        // ex) ある程度VX>0.3なら→,VX<-0.3なら←, VY>0.3なら↓, etc
        this.keys["ArrowLeft"]  = (vx < -0.3);
        this.keys["ArrowRight"] = (vx >  0.3);
        this.keys["ArrowUp"]    = (vy < -0.3);
        this.keys["ArrowDown"]  = (vy >  0.3);
      };

      // touchstart
      stickArea.addEventListener("touchstart", (e) => {
        e.preventDefault();
        active = true;
        // 1本目のタッチだけ扱う
        const t = e.touches[0];
        handleTouchMove(t);
      });

      // touchmove
      stickArea.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (!active) return;
        const t = e.touches[0];
        handleTouchMove(t);
      });

      // touchend
      stickArea.addEventListener("touchend", (e) => {
        e.preventDefault();
        active = false;
        // 離したらキーOFF
        this.keys["ArrowLeft"]  = false;
        this.keys["ArrowRight"] = false;
        this.keys["ArrowUp"]    = false;
        this.keys["ArrowDown"]  = false;
      });
    }

    // ----------------------------
    // 2) 右側の十字キー
    // ----------------------------
    const arrowUp = document.getElementById("arrowUp");
    const arrowDown = document.getElementById("arrowDown");
    const arrowLeft = document.getElementById("arrowLeft");
    const arrowRight = document.getElementById("arrowRight");

    // それぞれ touchstart で ON, touchend で OFF
    if (arrowUp) {
      arrowUp.addEventListener("touchstart", (e)=>{
        e.preventDefault();
        this.keys["ArrowUp"] = true;
      });
      arrowUp.addEventListener("touchend", (e)=>{
        e.preventDefault();
        this.keys["ArrowUp"] = false;
      });
    }
    if (arrowDown) {
      arrowDown.addEventListener("touchstart", (e)=>{
        e.preventDefault();
        this.keys["ArrowDown"] = true;
      });
      arrowDown.addEventListener("touchend", (e)=>{
        e.preventDefault();
        this.keys["ArrowDown"] = false;
      });
    }
    if (arrowLeft) {
      arrowLeft.addEventListener("touchstart", (e)=>{
        e.preventDefault();
        this.keys["ArrowLeft"] = true;
      });
      arrowLeft.addEventListener("touchend", (e)=>{
        e.preventDefault();
        this.keys["ArrowLeft"] = false;
      });
    }
    if (arrowRight) {
      arrowRight.addEventListener("touchstart", (e)=>{
        e.preventDefault();
        this.keys["ArrowRight"] = true;
      });
      arrowRight.addEventListener("touchend", (e)=>{
        e.preventDefault();
        this.keys["ArrowRight"] = false;
      });
    }
  }
}
