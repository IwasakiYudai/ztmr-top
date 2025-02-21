// main.js

let engine = null;

/** 複数ステージのマップデータ */
const stageData = [
  [
    "====================",
    "=..................=",
    "=.===.=.======.===.=",
    "=..S..=......=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=......=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E.................=",
    "====================",
  ],
  [
    // 例: 2面目 (省略・適宜追加)
    "====================",
    "=..................=",
    "=.===.=.======.===.=",
    "=..S..=......=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=......=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E.................=",
    "====================",
  ],
  [
    // 例: 3面目 (省略・適宜追加)
    "====================",
    "=.................E=",
    "=.===.=.======.===.=",
    "=..S..=......=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=......=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E.................=",
    "====================",
  ],
  [
    // 例: 4面目 (省略・適宜追加)
    "====================",
    "=.................E=",
    "=.===.=.======.===.=",
    "=..S..=......=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=......=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E.................=",
    "====================",
  ],
  [
    // 例: 5面目 (省略・適宜追加)
    "====================",
    "=.................E=",
    "=.===.=.======.===.=",
    "=..S..=......=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=......=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
  [
    // 例: 6面目 (省略・適宜追加)
    "====================",
    "=.................E=",
    "=.===.=.======.===.=",
    "=..S..=......=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=......=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
  [
    // 例: 7面目 (省略・適宜追加)
    "====================",
    "=E................E=",
    "=.===.=.======.===.=",
    "=..S..=......=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=......=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
  [
    // 例: 8面目 (省略・適宜追加)
    "====================",
    "=E................E=",
    "=.===.=.======.===.=",
    "=..S..=......=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=......=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
  [
    // 例: 9面目 (省略・適宜追加)
    "====================",
    "=E................E=",
    "=.===.=.======.===.=",
    "=..S..=......=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=..E...=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
  [
    // 例: 10面目 (省略・適宜追加)
    "====================",
    "=E................E=",
    "=.===.=.======.===.=",
    "=..S..=..E...=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=..E...=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
  [
    // 例: 10面目 (省略・適宜追加)
    "====================",
    "=E................E=",
    "=.===.=.======.===.=",
    "=..S..=..E...=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=..E...=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
  [
    // 例: 10面目 (省略・適宜追加)
    "====================",
    "=E................E=",
    "=.===.=.======.===.=",
    "=..S..=..E...=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=..E...=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
  [
    // 例: 10面目 (省略・適宜追加)
    "====================",
    "=E................E=",
    "=.===.=.======.===.=",
    "=..S..=..E...=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=..E...=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
  [
    // 例: 10面目 (省略・適宜追加)
    "====================",
    "=E................E=",
    "=.===.=.======.===.=",
    "=..S..=..E...=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=..E...=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
  [
    // 例: 10面目 (省略・適宜追加)
    "====================",
    "=E................E=",
    "=.===.=.======.===.=",
    "=..S..=..E...=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=..E...=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
  [
    // 例: 10面目 (省略・適宜追加)
    "====================",
    "=E................E=",
    "=.===.=.======.===.=",
    "=..S..=..E...=..S..=",
    "=.===.=.====.=.===.=",
    "=.....=......=.....=",
    "=.===.======.=.===.=",
    "=.........P........=",
    "===.===.====.===.===",
    "===...=..E...=...===",
    "===.=.=.====.=.=.===",
    "=S..=..........=..S=",
    "=.=====.====.=====.=",
    "=E................E=",
    "====================",
  ],
];

/** 現在のステージ番号 */
let stageIndex = 0;

/****************************************
 * ページ読み込み時
 ****************************************/
window.onload = async () => {
  const canvas = document.getElementById("gameCanvas");
  engine = new Engine(canvas);

  // ▼ ゲームオーバー時のコールバック ▼
  engine.onGameOverCallback = (finalScore) => {
  // ゲームオーバー画面を表示
    const overOvl = document.getElementById("gameOverOverlay");
    const msg     = document.getElementById("gameOverMessage");
    const nameInput = document.getElementById("playerNameInput");
    const registerBtn = document.getElementById("registerScoreBtn");
    const restartBtn  = document.getElementById("restartBtn");

    if (overOvl && msg && nameInput && registerBtn && restartBtn) {
      // メッセージと入力欄、登録ボタンを最初は表示状態に戻す(複数回ゲームオーバー時のため)
      msg.style.display          = "block";
      nameInput.style.display    = "block";
      registerBtn.style.display  = "inline-block";

      msg.textContent = `ゲームオーバー！ Score: ${finalScore}`;
      overOvl.style.display = "flex";

      // ランキング登録ボタンが押されたとき
      registerBtn.onclick = () => {
        // 名前入力があれば登録
        const rawName = nameInput.value;
        const safeName = sanitizeName(rawName); // 例: 空白除去＆禁止ワードチェック

        if (safeName.length > 0) {
          // 文字数が0じゃなければ、ランキング登録
          addScoreToRanking(safeName, finalScore);
        }
        // 入力欄 & 登録ボタン & メッセージを隠す
        nameInput.style.display   = "none";
        registerBtn.style.display = "none";
        msg.style.display         = "none";

        // → 結果、リスタートボタンだけが残る状態に
      };
    }
  };
  // アセット読み込み
  await engine.loadAssets();

  // 最初のステージをロード (まだ start() はしない)
  stageIndex = 0;
  loadStage(stageIndex);

  // ▼▼ スタート画面「ゲームを始める」ボタン ▼▼
  const startBtn = document.getElementById("startGameBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      document.getElementById("startOverlay").style.display = "none";
      engine.start();  // ゲーム開始
    });
  }

  // ▼▼ ゲームオーバー画面の「リスタート」ボタン ▼▼
  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      document.getElementById("gameOverOverlay").style.display = "none";
      resetAllGame(); // 最初からやり直す
    });
  }



  // ▼▼ ランキング閉じるボタン ▼▼
  const closeRankBtn = document.getElementById("closeRankBtn");
  if (closeRankBtn) {
    closeRankBtn.addEventListener("click", () => {
      document.getElementById("rankingOverlay").style.display = "none";
    });
  }

  // ▼▼ 下メニュー: 「遊ぶ」「ランキング」「遊び方」ボタン ▼▼
  const playBtn   = document.getElementById("playBtn");
  const rankBtn   = document.getElementById("rankBtn");
  const manualBtn = document.getElementById("manualBtn");

  // 「遊ぶ」→ 最初から
  if (playBtn) {
    playBtn.addEventListener("click", () => {
  // 1) すべてのオーバーレイを隠す
      hideAllOverlays();

      // 2) ゲームを停止＆初期化 (まだ開始しない)
      resetGameNoStart();

      // 3) スタート画面を再度表示する
      const startOverlay = document.getElementById("startOverlay");
      if (startOverlay) {
        startOverlay.style.display = "flex";
      }
    });
  }

  // 「ランキング」→ ランキング表示
  if (rankBtn) {
    rankBtn.addEventListener("click", () => {
      engine.stop();
      hideAllOverlays();
      const html  = getRankingHTML();
      const list  = document.getElementById("rankingList");
      if (list) list.innerHTML = html;
      const rovl = document.getElementById("rankingOverlay");
      if (rovl) rovl.style.display = "flex";
    });
  }

  // 「遊び方」→ いまはアラート
  if (manualBtn) {
    manualBtn.addEventListener("click", () => {
      alert("十字キー/WASD(スマートフォンはスティック、十字ボタン) で移動、敵に当たらないようドットと巻物を集める！");
    });
  }
};

/****************************************
 * ステージをロード (stageIndex番)
 ****************************************/
function loadStage(index) {
  // いったん停止 & 画面クリア
  engine.stop();
  engine.ctx.clearRect(0, 0, 640, 480);

  // 既存オブジェクトを消す
  engine.objects = [];

  // 新しいマップを生成
  const data = stageData[index];
  engine.gameMap = new GameMap(data);
  engine.gameMap.init(engine);
}

/****************************************
 * 全ゲームを最初からリセット
 * (ライフ3, スコア0, ステージ0 に戻す)
 ****************************************/
function resetAllGame() {
  engine.stop();
  engine.ctx.clearRect(0, 0, 640, 480);

  engine.score      = 0;
  engine.playerLife = 3;   // エンジンにあるライフを初期化

  stageIndex = 0;
  engine.objects = [];

  loadStage(stageIndex);
  engine.start();
}

/****************************************
 * 全ドット取得 → 次ステージ
 ****************************************/
function nextStage() {
  stageIndex++;
  if (stageIndex >= stageData.length) {
    // 全ステージクリア
    alert("全ステージクリア!\nScore: " + engine.score);
    addScoreToRanking("Player", engine.score);
    engine.stop();
    // もう一度最初からでもOK
    stageIndex = 0;
    engine.score = 0;
    engine.playerLife = 3;
    loadStage(stageIndex);
    return;
  }
  // 次ステージへ
  loadStage(stageIndex);
  engine.start();
}

/****************************************
 * ライフが減った: スコアそのままでステージだけリセット
 ****************************************/
function stageResetButKeepScore() {
  engine.stop();
  engine.ctx.clearRect(0, 0, 640, 480);

  // objectsを空にして同じstageIndexを再度読み込み
  engine.objects = [];
  loadStage(stageIndex);
  engine.start();
}

/****************************************
 * オーバーレイを全部隠す
 ****************************************/
function hideAllOverlays() {
  const list = ["startOverlay","gameOverOverlay","rankingOverlay"];
  for (const id of list) {
    const el = document.getElementById(id);
    if (el) el.style.display="none";
  }
}

/****************************************
 * ランキング (クッキー)
 ****************************************/
function setCookie(name, value, days=731) {
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  const expires = "expires="+ d.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
}

function getCookie(name) {
  const decoded = decodeURIComponent(document.cookie);
  const arr     = decoded.split(";");
  for(const cStr of arr){
    const c = cStr.trim();
    if(c.indexOf(name+"=")===0){
      return c.substring((name+"=").length);
    }
  }
  return "";
}

function loadRankingFromCookie() {
  const val = getCookie("myGameRanking");
  if(!val) return [];
  try {
    return JSON.parse(val);
  } catch(e){
    console.error("ranking parse error", e);
    return [];
  }
}

function saveRankingToCookie(arr) {
  const str = JSON.stringify(arr);
  setCookie("myGameRanking", str, 365);
}

function addScoreToRanking(name, score) {
  let rank = loadRankingFromCookie();
  rank.push({ name, score, date: new Date().toISOString().slice(0,10) });
  rank.sort((a,b)=> b.score - a.score);
  rank = rank.slice(0,10);
  saveRankingToCookie(rank);
}

function getRankingHTML() {
  const rank = loadRankingFromCookie();
  let html = "";
  rank.forEach((r,i)=>{
    html+=`<li>${i+1}. ${r.name} - ${r.score} pts (${r.date})</li>`;
  });
  return `<ol>${html}</ol>`;
}

function resetGameNoStart() {
  // いったん停止 & 画面クリア
  engine.stop();
  engine.ctx.clearRect(0, 0, 640, 480);

  // スコアとライフを初期化
  engine.score      = 0;
  engine.playerLife = 3; 

  // ステージインデックスを0に戻す
  stageIndex = 0;
  // オブジェクト配列を空に
  engine.objects = [];

  // ステージをロード (まだ start はしない)
  loadStage(stageIndex);
}


/**
 * sanitizeName(rawName):
 * - 前後の空白除去
 * - 10文字制限
 * - 禁止ワード ( blockedWords ) を含んでいたら "???" に置き換える
 */
function sanitizeName(rawName) {
  // 例: 先頭と末尾の空白除去
  let name = rawName.trim();

  // 長さ制限（任意: 10文字まで）
  if (name.length > 10) {
    name = name.substring(0, 10);
  }

  // 禁止ワードの簡易チェック
  const blockedWords = [
    // ▼ 暴言・罵倒
    "死ね",
    "しね",
    "殺す",
    "くたばれ",
    "ばか",     // 漢字表記「馬鹿」なども必要に応じて追加
    "あほ",
    "クソ",     // 大文字・小文字、ひらがな・カタカナも考慮
    "糞",

    // ▼ 下品・性的表現
    "まんこ",
    "ちんこ",
    "ちんちん",
    "まんまん",
    "オメコ",
    "フェラ",
    "セックス",
    "sex",      // ローマ字/英語表記も考慮
    "fuck",     // 英語での罵倒・卑猥表現
    "shit",
    "bitch",

    // ▼ その他、不快・脅迫表現
    "氏ね",     // 「死ね」の変形表記
    "殺すぞ",
    "死んじまえ",
    // ... 必要に応じて追加
  ];

  const lower = name.toLowerCase();
  for (let w of blockedWords) {
    if (lower.includes(w)) {
      // 該当単語を含む → 強制的に "???"
      name = "???";
      break;
    }
  }

  return name;
}
