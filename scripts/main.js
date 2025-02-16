// main.js

let engine = null;

window.onload = async () => {
  const canvas = document.getElementById("gameCanvas");
  engine = new Engine(canvas);

  // 1) まず画像など読み込み
  await engine.loadAssets();

  // 2) マップ作成
  engine.gameMap = new GameMap();

  // 3) init で map.init(engine) など
  engine.gameMap.init(engine);

  // 4) いよいよ開始
  engine.start();
};
