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

    // ▼ 仮想スティック＆ボタンのモバイル操作を有効化
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
      let active = false;
      let activeTouchId = null;

      // 円の中心 (計算用)
      let centerX = 0;
      let centerY = 0;

      // 指が動いたら方向ベクトルを計算
      const handleStickMove = (clientX, clientY) => {
        const rect = stickArea.getBoundingClientRect();
        // スティック円の中心
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;

        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const dist = Math.hypot(dx, dy);

        // ある程度の deadZone
        const deadZone = 10;
        let vx = 0, vy = 0;
        if (dist > deadZone) {
          vx = dx / dist;
          vy = dy / dist;
        }
        // vx, vy → keys 変換
        this.keys["ArrowLeft"]  = (vx < -0.3);
        this.keys["ArrowRight"] = (vx >  0.3);
        this.keys["ArrowUp"]    = (vy < -0.3);
        this.keys["ArrowDown"]  = (vy >  0.3);
      };

      // タッチ開始は stickArea 上のみ
      stickArea.addEventListener("touchstart", (e) => {
        e.preventDefault();
        const t = e.changedTouches[0];
        if (!active) {
          active = true;
          activeTouchId = t.identifier;
          // 最初に位置を読み取って
          handleStickMove(t.clientX, t.clientY);
        }
      });

      // → 指が外に出ても同じ指ID で操作継続したいので window に touchmove
      window.addEventListener("touchmove", (e) => {
        if (!active) return;
        for (const t of e.changedTouches) {
          if (t.identifier === activeTouchId) {
            e.preventDefault();
            handleStickMove(t.clientX, t.clientY);
            break;
          }
        }
      });

      // 指が離れた → 操作終了
      window.addEventListener("touchend", (e) => {
        if (!active) return;
        for (const t of e.changedTouches) {
          if (t.identifier === activeTouchId) {
            e.preventDefault();
            active = false;
            activeTouchId = null;
            // 離したらキーOFF
            this.keys["ArrowLeft"]  = false;
            this.keys["ArrowRight"] = false;
            this.keys["ArrowUp"]    = false;
            this.keys["ArrowDown"]  = false;
            break;
          }
        }
      });

      window.addEventListener("touchcancel", (e) => {
        if (!active) return;
        for (const t of e.changedTouches) {
          if (t.identifier === activeTouchId) {
            e.preventDefault();
            active = false;
            activeTouchId = null;
            // 離したらキーOFF
            this.keys["ArrowLeft"]  = false;
            this.keys["ArrowRight"] = false;
            this.keys["ArrowUp"]    = false;
            this.keys["ArrowDown"]  = false;
            break;
          }
        }
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
      arrowUp.addEventListener("touchcancel", (e)=>{
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
      arrowDown.addEventListener("touchcancel", (e)=>{
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
      arrowLeft.addEventListener("touchcancel", (e)=>{
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
      arrowRight.addEventListener("touchcancel", (e)=>{
        e.preventDefault();
        this.keys["ArrowRight"] = false;
      });
    }
  }
}
