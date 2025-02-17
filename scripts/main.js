// main.js

let engine = null;

window.onload = async () => {
  const canvas = document.getElementById("gameCanvas");
  engine = new Engine(canvas);

  // ゲームオーバー時のコールバック
  engine.onGameOverCallback = (finalScore) => {
    // #gameOverOverlay を表示 & スコアを表示
    const over = document.getElementById("gameOverOverlay");
    const msg = document.getElementById("gameOverMessage");
    if (over && msg) {
      msg.textContent = `ゲームオーバー！ Score: ${finalScore}`;
      over.style.display = "flex"; // 表示
    }
  };

  await engine.loadAssets();
  engine.gameMap = new GameMap();
  engine.gameMap.init(engine);

  // ▼▼ スタート画面 (overlay) ▼▼
  const startOverlay = document.getElementById("startOverlay");
  const startBtn = document.getElementById("startGameBtn");
  startBtn.addEventListener("click", () => {
    startOverlay.style.display = "none";
    engine.start();
  });

  // ▼▼ ゲームオーバーのリスタートボタン ▼▼
  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      // 1) ゲームオーバーオーバーレイを消す
      document.getElementById("gameOverOverlay").style.display = "none";
      // 2) 状態をリセット(簡易: engine再生成 など)
      resetGame(); 
    });
  }
};

// ★ ゲームを再スタートする方法 (簡易)
function resetGame() {
  // 今のengineをstop
  engine.stop();
  // canvasを一度クリア or 画面リセット
  engine.ctx.clearRect(0, 0, 640, 480);

  // 新しいEngineを作る or engine内部を初期状態に戻す
  engine = new Engine(document.getElementById("gameCanvas"));
  engine.onGameOverCallback = (finalScore) => {
    // 同じコールバックを再設定
    const over = document.getElementById("gameOverOverlay");
    const msg = document.getElementById("gameOverMessage");
    msg.textContent = `ゲームオーバー！ Score: ${finalScore}`;
    over.style.display = "flex";
  };

  // 再度ロード & マップinit
  engine.loadAssets().then(() => {
    engine.gameMap = new GameMap();
    engine.gameMap.init(engine);
    engine.start();
  });
}
