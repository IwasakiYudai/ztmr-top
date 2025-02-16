// ----------------------------------------
// 1) 定数＆Kaboom初期化

const TILE_SIZE = 32;   // タイル幅・高さ
const ENEMY_SPEED = 10; // 敵の追尾速度

kaboom({
  global: true,         // kaboom関数をグローバルに
  width: 640,
  height: 480,
  debug: true,          // デバッグ表示ON
  clearColor: [0, 0, 0, 1],
});

// ----------------------------------------
// 2) 画像（存在しなくてもOK） → 無いと警告は出るが "=" 読み取りエラーには関係なし

loadSprite("scrollBig", "scrollBig.png");     // プレイヤー (大きい巻物)
loadSprite("scrollSmall", "scrollSmall.png"); // ペレット (小巻物)
loadSprite("enemy", "enemy.png");            // 敵
loadSprite("wall", "wall.png");              // 壁

// ----------------------------------------
// 3) "game" シーン (パックマン風)

scene("game", () => {

  // スコアを管理する変数
  let score = 0;

  // タイルマップ: "=" ".", "P", "E"
  const levelMap = [
    "================",
    "=......E.......",
    "=.==.==.==.==.==",
    "=P..........E..",
    "================",
  ];

  // タイル設定
  const levelConf = {
    // 重要: v3000系は tileWidth/tileHeight
    tileWidth: TILE_SIZE,
    tileHeight: TILE_SIZE,
    // 文字 "=" → 壁
    "=": () => [
      sprite("wall"),
      area(),
      solid(),
      "wall",
    ],
    // 文字 "." → ペレット
    ".": () => [
      sprite("scrollSmall"),
      area(),
      "pellet",
    ],
    // 文字 "P" → プレイヤー
    "P": () => [
      sprite("scrollBig"),
      area(),
      "player",
    ],
    // 文字 "E" → 敵
    "E": () => [
      sprite("enemy"),
      area(),
      "enemy",
    ],
  };

  // 実際にタイルマップを生成
  addLevel(levelMap, levelConf);

  // プレイヤー取得
  const player = get("player")[0];

  // 矢印キーで移動
  onKeyDown("left",  () => player.move(-100, 0));
  onKeyDown("right", () => player.move(100, 0));
  onKeyDown("up",    () => player.move(0, -100));
  onKeyDown("down",  () => player.move(0, 100));

  // 敵のAI (プレイヤー追尾)
  onUpdate("enemy", (enemy) => {
    const dir = player.pos.sub(enemy.pos).unit();
    enemy.move(dir.scale(ENEMY_SPEED));
  });

  // ペレット衝突
  onCollide("player", "pellet", (p, pellet) => {
    destroy(pellet);
    score++;
    // ペレットが0になったらクリア扱い
    if (get("pellet").length === 0) {
      go("lose", score);
    }
  });

  // 敵衝突 → lose
  onCollide("player", "enemy", () => {
    go("lose", score);
  });

  // スコア表示（左上）
  const scoreLabel = add([
    text(score),
    pos(24, 24),
  ]);
  onUpdate(() => {
    scoreLabel.text = score;
  });

});

// ----------------------------------------
// 4) "lose" シーン

scene("lose", (score) => {
  add([
    text(`Game Over! Score: ${score}`),
    pos(100, 100),
  ]);
  add([
    text("Press SPACE or click to retry"),
    pos(100, 140),
  ]);

  onKeyPress("space", () => go("game"));
  onClick(() => go("game"));
});

// ----------------------------------------
// 5) ゲーム開始
go("game");
