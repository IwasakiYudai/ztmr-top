class Enemy {
  constructor(col, row) {
    this.col = col;
    this.row = row;
    this.x = col * 32 + 16;
    this.y = row * 32 + 16;

    this.baseSpeed = 90;  // 通常
    this.dead = false;
    this.isEscaping = false;

    this.lastDir = null;
    this.targetX = this.x;
    this.targetY = this.y;
  }

  update(dt, engine) {
    if (this.dead) return;

    // 逃走中 → 速度60, 通常 → 速度90
    const speed = (this.isEscaping ? 60 : this.baseSpeed);

    // タイル中央への移動が途中ならそこまで進む
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const remain = Math.hypot(dx, dy);

    if (remain > 1) {
      // まだ途中
      const ux = dx / remain;
      const uy = dy / remain;
      const move = speed * dt;
      if (move >= remain) {
        this.x = this.targetX;
        this.y = this.targetY;
      } else {
        this.x += ux * move;
        this.y += uy * move;
      }
    } else {
      // タイル中央に到達 → 次のタイルを決める
      const player = engine.objects.find(o => o instanceof Player);

      if (player) {
        const distManhattan = Math.abs(player.col - this.col) + Math.abs(player.row - this.row);

        // 距離が8タイル以内かどうかで行動を変える(お好みで)
        if (distManhattan <= 8) {
          if (this.isEscaping) {
            // ★ (A) 逃走ロジック: プレイヤーとの距離が「大きくなる」隣タイルを選ぶ
            this.lastDir = this.decideAwayFromPlayer(engine, player) || this.randomDir(engine);
          } else {
            // ★ (B) 通常ロジック: BFSで近づく
            const dir = this.decideDirectionBFS(engine, player, /* isEscaping= */false);
            this.lastDir = dir || this.randomDir(engine);
          }
        } else {
          // プレイヤーが遠い→ ランダム or 従来BFS
          this.lastDir = this.randomDir(engine);
        }
      } else {
        // プレイヤーいない→ ランダム
        this.lastDir = this.randomDir(engine);
      }

      // 次のタイルへ
      const tileSize = 32;
      const nc = this.col + (this.lastDir === "left" ? -1 : this.lastDir === "right" ? 1 : 0);
      const nr = this.row + (this.lastDir === "up"   ? -1 : this.lastDir === "down"  ? 1 : 0);

      const tx = nc * tileSize + 16;
      const ty = nr * tileSize + 16;
      if (!engine.gameMap.isWall(tx, ty)) {
        this.col = nc;
        this.row = nr;
        this.targetX = tx;
        this.targetY = ty;
      }
    }
  }

  // (1) 逃走用: "プレイヤーから最も遠い" 隣タイルを選ぶ
  decideAwayFromPlayer(engine, player) {
    // player を起点に BFS で全タイルの距離を計算
    const distMap = this.buildDistanceMapFromPlayer(engine, player);

    // 今いるタイルから左・右・上・下 どこへ行けば distMap が最大化するか
    const tileSize = 32;
    let bestDir = null;
    let bestDist = -999999;

    const candidates = [
      ["left",  -1, 0],
      ["right", 1, 0],
      ["up",    0, -1],
      ["down",  0,  1],
    ];

    for (const [dName, dc, dr] of candidates) {
      const nc = this.col + dc;
      const nr = this.row + dr;
      const key = `${nc},${nr}`;
      // distMap[key] が 大きいほどプレイヤーから遠い
      if (distMap[key] !== undefined) {
        if (distMap[key] > bestDist) {
          bestDist = distMap[key];
          bestDir = dName;
        }
      }
    }

    return bestDir;
  }

  // (2) BFSで [player.col, player.row] から各タイルへの距離を distMap に格納
  buildDistanceMapFromPlayer(engine, player) {
    const map = {}; // キー "col,row" → 距離(ステップ数)
    const start = { c: player.col, r: player.row };
    map[`${start.c},${start.r}`] = 0;

    const queue = [start];
    const visited = new Set();
    visited.add(`${start.c},${start.r}`);

    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const tileSize = 32;

    while (queue.length > 0) {
      const cur = queue.shift();
      const curDist = map[`${cur.c},${cur.r}`];
      for (const [dc, dr] of dirs) {
        const nc = cur.c + dc;
        const nr = cur.r + dr;
        const key = `${nc},${nr}`;
        if (visited.has(key)) continue;

        const tx = nc * tileSize + 16;
        const ty = nr * tileSize + 16;
        if (engine.gameMap.isWall(tx, ty)) continue;

        visited.add(key);
        queue.push({ c: nc, r: nr });
        map[key] = curDist + 1; // BFS なので +1
      }
    }

    return map;
  }

  // (3) 通常 BFS (プレイヤーに近づく)
  //   isEscaping = false の場合はこちらを使う
  decideDirectionBFS(engine, player, isEscaping) {
    const start = { c: this.col, r: this.row };
    const goal  = { c: player.col, r: player.row };
    const tileSize = 32;

    const queue = [start];
    const visited = new Set();
    visited.add(`${start.c},${start.r}`);
    const prev = {};
    prev[`${start.c},${start.r}`] = null;

    const dirs = [
      ["left", -1, 0],
      ["right",1, 0],
      ["up",   0, -1],
      ["down", 0,  1],
    ];

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.c === goal.c && cur.r === goal.r) {
        // 経路復元
        return this.reconstructFirstMove(cur, prev);
      }
      for (const [dName, dc, dr] of dirs) {
        const nc = cur.c + dc;
        const nr = cur.r + dr;
        const key = `${nc},${nr}`;
        if (!visited.has(key)) {
          const tx = nc*tileSize +16;
          const ty = nr*tileSize +16;
          if (!engine.gameMap.isWall(tx,ty)) {
            visited.add(key);
            queue.push({ c:nc, r:nr });
            prev[key] = `${cur.c},${cur.r}`;
          }
        }
      }
    }
    return null;
  }

  reconstructFirstMove(cur, prev){
    let nodeKey = `${cur.c},${cur.r}`;
    const path = [];
    while (nodeKey) {
      path.unshift(nodeKey);
      nodeKey = prev[nodeKey];
    }
    if (path.length < 2) return null;

    const [sC,sR] = path[0].split(",").map(Number);
    const [nC,nR] = path[1].split(",").map(Number);
    if (nC<sC) return "left";
    if (nC> sC)return "right";
    if (nR< sR)return "up";
    if (nR> sR)return "down";
    return null;
  }

  randomDir(engine) {
    const tileSize = 32;
    const possible = ["left","right","up","down"];
    let opposite=null;
    if(this.lastDir==="left")  opposite="right";
    if(this.lastDir==="right") opposite="left";
    if(this.lastDir==="up")    opposite="down";
    if(this.lastDir==="down")  opposite="up";

    const good=[];
    for(const d of possible){
      if(d===opposite) continue;
      const nc=this.col + (d==="left"?-1 : d==="right"?1 :0);
      const nr=this.row + (d==="up"?-1 : d==="down"?1 :0);
      const tx=nc*tileSize +16;
      const ty=nr*tileSize +16;
      if(!engine.gameMap.isWall(tx,ty)){
        good.push(d);
      }
    }
    if(good.length>0){
      return good[Math.floor(Math.random()*good.length)];
    }
    return possible[Math.floor(Math.random()*possible.length)];
  }

  draw(ctx, engine) {
    if(this.dead) return;
    const eImg = engine.images["enemy"];
    if(eImg){
      ctx.drawImage(eImg, this.x-16, this.y-16, 32,32);
    } else {
      ctx.fillStyle="red";
      ctx.fillRect(this.x-8,this.y-8,16,16);
    }
  }
}
