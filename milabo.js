const videoIDs = [
    "I88PrE-KUPk?si=FNudarP0yvEdtj0G",
];
const randomIndex = Math.floor(Math.random() * videoIDs.length);
const chosenID = videoIDs[randomIndex];

const iframe = document.getElementById("youtube-iframe");
iframe.src = "https://www.youtube.com/embed/" + chosenID + "?autoplay=1&mute=1";



// 画面ロード後、Canvasを取得
window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // ゲームの初期化
  initGame(ctx);

  // フレーム更新用 (60FPS想定)
  function gameLoop() {
    updateGame();
    drawGame(ctx);
    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
});

// 変数・状態を定義 (例: パックマン風キャラのx,y など)
let playerX = 100;
let playerY = 100;
let speed = 2;

// キー入力状態
let keys = {};

// 初期化
function initGame(ctx) {
  // イベントリスナー
  window.addEventListener('keydown', e => {
    keys[e.key] = true;
  });
  window.addEventListener('keyup', e => {
    keys[e.key] = false;
  });
}

// 更新
function updateGame() {
  // 矢印キーで移動(例)
  if (keys['ArrowUp']) playerY -= speed;
  if (keys['ArrowDown']) playerY += speed;
  if (keys['ArrowLeft']) playerX -= speed;
  if (keys['ArrowRight']) playerX += speed;

  // 画面外に出ないように制限
  if (playerX < 0) playerX = 0;
  if (playerX > 640-20) playerX = 620; // 幅20ピクセルの仮キャラ
  if (playerY < 0) playerY = 0;
  if (playerY > 480-20) playerY = 460;
}

// 描画
function drawGame(ctx) {
  // 画面クリア
  ctx.clearRect(0, 0, 640, 480);

  // 背景(黒)を塗り直すなら:
  // ctx.fillStyle = 'black';
  // ctx.fillRect(0,0,640,480);

  // プレイヤー(仮: 黄色い四角)
  ctx.fillStyle = 'yellow';
  ctx.fillRect(playerX, playerY, 20, 20);

  // ここでゴーストやドットを描画... etc.
}
