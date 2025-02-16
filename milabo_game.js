// game.js (外部ファイルなどで管理)
//--------------------------------------
// Kaboom初期化
kaboom({
  global: true,
  width: 640,
  height: 480,
  // 画面に合わせて設定
  debug: true,
  clearColor: [0, 0, 0, 1], // 背景を黒
});

// 画像読み込み
loadSprite("scrollBig", "scrollBig.png");      // プレイヤー
loadSprite("scrollSmall", "scrollSmall.png");  // ペレット
loadSprite("enemy", "enemy.png");             // 敵
loadSprite("wall", "wall.png");               // 壁など

// シーン: 例「stage1」
scene("stage1", () => {

  let score = 0;   // スコア（ペレット取得数）

  // レベルマップ (タイルベース)
  // 例: "=" が壁, "." がペレット, "P" がプレイヤー, "E" が敵
  const levelMap = [
    "================",
    "=......E.......",
    "=.==.==.==.==.==",
    "=P..........E..",
    "================",
  ];
  
  // タイル設定
  const levelConf = {
    width: 32,      // タイル1個の幅
    height: 32,     // タイル1個の高さ
    // 実際の画像や当たり判定を付けるコンポーネント
    "=": () => [
      sprite("wall"),
      area(),
      solid(),
      "wall",
    ],
    ".": () => [
      sprite("scrollSmall"),
      area(),
      "pellet",   // ペレットタグ
    ],
    "P": () => [
      sprite("scrollBig"),
      area(),
      "player",
    ],
    "E": () => [
      sprite("enemy"),
      area(),
      "enemy",
    ],
  };

  // レベル配置
  const gameLevel = addLevel(levelMap, levelConf);

  // プレイヤー取得（タイル上で "P" として生成されたオブジェクト）
  const player = get("player")[0];

  // 敵オブジェクトたち (複数いる可能性)
  const enemies = get("enemy");

  // プレイヤー移動
  onKeyDown("left", () => {
    player.move(-100, 0);
  });
  onKeyDown("right", () => {
    player.move(100, 0);
  });
  onKeyDown("up", () => {
    player.move(0, -100);
  });
  onKeyDown("down", () => {
    player.move(0, 100);
  });

  // ペレット取得の衝突判定
  onCollide("player", "pellet", (p, pellet) => {
    destroy(pellet);
    score++;
    // 全部取ったらステージクリア
    if (get("pellet").length === 0) {
      go("stage2", score);
    }
  });

  // 敵との衝突 → ゲームオーバー
  onCollide("player", "enemy", () => {
    // 例: リトライシーンに飛ばす or ライフ減らす
    go("gameOver", { score: score });
  });

  // 敵のAI (例: プレイヤーを追う or ただのランダム移動)
  onUpdate("enemy", (e) => {
    // 簡単にプレイヤー座標を取得して追尾 (速度10)
    const dir = player.pos.sub(e.pos).unit(); // 単位ベクトル
    e.move(dir.scale(10));
  });
});

// 次ステージ例
scene("stage2", (oldScore) => {
  // oldScore は stage1から引き継いだスコア
  // 同じようにマップ定義
  // ...
});

// ゲームオーバーシーン
scene("gameOver", ({score}) => {
  add([
    text(`Game Over! Score: ${score}`, 16),
    pos(100, 100),
  ]);
  onKeyPress(() => go("stage1"));  // any key to restart
});

// 最初はstage1から
go("stage1");
