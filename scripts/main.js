// main.js

let engine = null;

/****************************************
 * 1) ページ読み込み時のメイン処理
 ****************************************/
window.onload = async () => {
  const canvas = document.getElementById("gameCanvas");
  // エンジン作成
  engine = new Engine(canvas);

  // -------------------------------------
  // ゲームオーバー時のコールバック
  // -------------------------------------
  engine.onGameOverCallback = (finalScore) => {
    // 1) ランキング追加
    addScoreToRanking("Player", finalScore);

    // 2) ランキングHTML生成して表示
    const html = getRankingHTML();
    const rankOvl = document.getElementById("rankingOverlay");
    const rankList = document.getElementById("rankingList");
    if (rankOvl && rankList) {
      rankList.innerHTML = html;
      rankOvl.style.display = "flex"; // ランキングオーバーレイを表示
    }

    // 3) ゲームオーバーオーバーレイも表示したいなら:
    const gameOverOvl = document.getElementById("gameOverOverlay");
    const msg = document.getElementById("gameOverMessage");
    if (gameOverOvl && msg) {
      msg.textContent = `ゲームオーバー！ Score: ${finalScore}`;
      gameOverOvl.style.display = "flex";
    }
  };

  // アセット読み込み
  await engine.loadAssets();

  // マップ生成
  engine.gameMap = new GameMap();
  engine.gameMap.init(engine);

  // -------------------------------------
  // 各ボタンのイベント設定
  // -------------------------------------

  // ゲーム開始ボタン (スタート画面)
  const startBtn = document.getElementById("startGameBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      // スタートオーバーレイを消してゲーム開始
      document.getElementById("startOverlay").style.display = "none";
      engine.start();
    });
  }

  // リスタートボタン (ゲームオーバー画面)
  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      // ゲームオーバー画面を消し、リセット
      document.getElementById("gameOverOverlay").style.display = "none";
      resetGame();
    });
  }

  // ランキング閉じるボタン
  const closeRankBtn = document.getElementById("closeRankBtn");
  if (closeRankBtn) {
    closeRankBtn.addEventListener("click", () => {
      // ランキングオーバーレイを消す
      document.getElementById("rankingOverlay").style.display = "none";
      // 必要に応じてゲーム再開するなら↓
      // engine.start();
    });
  }

  // 「遊ぶ」「ランキング」「遊び方」ボタン (下のメニュー)
  const playBtn   = document.getElementById("playBtn");
  const rankBtn   = document.getElementById("rankBtn");
  const manualBtn = document.getElementById("manualBtn");

  // 遊ぶ: スタート画面に戻す
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      // ゲームを止めて、すべてのオーバーレイを隠し
      engine.stop();
      hideAllOverlays();
      // startOverlayを表示
      document.getElementById("startOverlay").style.display = "flex";
    });
  }

  // ランキング: ランキング画面を開く
  if (rankBtn) {
    rankBtn.addEventListener("click", () => {
      // ゲーム停止
      engine.stop();
      hideAllOverlays();
      // ランキングを更新して表示
      const rankHtml = getRankingHTML();
      const rankList = document.getElementById("rankingList");
      if (rankList) rankList.innerHTML = rankHtml;

      const rankOvl = document.getElementById("rankingOverlay");
      if (rankOvl) rankOvl.style.display = "flex";
    });
  }

  // 遊び方: いまはアラートのみ
  if (manualBtn) {
    manualBtn.addEventListener("click", () => {
      alert("遊び方はまだ準備中です。十字キー / WASD で移動、敵に当たらないよう巻物を集める等。");
    });
  }
};

/****************************************
 * 2) ゲームをリセットする処理 (簡易)
 ****************************************/
function resetGame() {
  // いまのゲームを止めて画面クリア
  engine.stop();
  engine.ctx.clearRect(0, 0, 640, 480);

  // 新しいEngineを作り直し (同じcanvas)
  engine = new Engine(document.getElementById("gameCanvas"));

  // onGameOverCallbackを再設定
  engine.onGameOverCallback = (finalScore) => {
    addScoreToRanking("Player", finalScore);
    const html = getRankingHTML();
    const rankOvl = document.getElementById("rankingOverlay");
    const rankList = document.getElementById("rankingList");
    if (rankOvl && rankList) {
      rankList.innerHTML = html;
      rankOvl.style.display = "flex";
    }
    const gameOverOvl = document.getElementById("gameOverOverlay");
    const msg = document.getElementById("gameOverMessage");
    if (gameOverOvl && msg) {
      msg.textContent = `ゲームオーバー！ Score: ${finalScore}`;
      gameOverOvl.style.display = "flex";
    }
  };

  // アセット再読み込みし、マップも再初期化
  engine.loadAssets().then(() => {
    engine.gameMap = new GameMap();
    engine.gameMap.init(engine);
    engine.start();
  });
}

/****************************************
 * 3) 全オーバーレイを非表示にする
 ****************************************/
function hideAllOverlays() {
  ["startOverlay", "gameOverOverlay", "rankingOverlay"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

/****************************************
 * 4) クッキーを使ったランキング関連
 ****************************************/
function setCookie(name, value, days=365) {
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  const expires = "expires="+ d.toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + ";" + expires + ";path=/";
}

function getCookie(name) {
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArr = decodedCookie.split(';');
  for (let i=0; i<cookieArr.length; i++){
    let c = cookieArr[i].trim();
    if (c.indexOf(name + "=")===0) {
      return c.substring((name+"=").length, c.length);
    }
  }
  return "";
}

// ランキング配列をクッキーから読み込み
function loadRankingFromCookie() {
  const val = getCookie("myGameRanking");
  if (!val) return [];
  try {
    return JSON.parse(val);
  } catch(e) {
    console.error("Failed to parse ranking cookie:", e);
    return [];
  }
}

// ランキングをクッキーに保存
function saveRankingToCookie(arr) {
  const str = JSON.stringify(arr);
  setCookie("myGameRanking", str, 365);
}

// スコアをランキングに追加 → 上位10件に絞る → クッキー保存
function addScoreToRanking(name, score) {
  let rank = loadRankingFromCookie();
  rank.push({
    name: name,
    score: score,
    date: new Date().toISOString().slice(0,10),
  });
  rank.sort((a,b) => b.score - a.score);
  rank = rank.slice(0,10);
  saveRankingToCookie(rank);
}

// HTMLリストを生成
function getRankingHTML() {
  const rank = loadRankingFromCookie();
  let html = "";
  rank.forEach((r, i) => {
    html += `<li>${i+1}. ${r.name} - ${r.score} pts (${r.date})</li>`;
  });
  return `<ol>${html}</ol>`;
}
