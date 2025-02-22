class Enemy {
  constructor(col, row) {
    // タイル座標 & ピクセル座標
    this.col = col;
    this.row = row;
    this.x = col * 32 + 16;
    this.y = row * 32 + 16;

    // 通常速度
    this.baseSpeed = 180;
    // 逃走時速度
    this.escapeSpeed = 140;

    // 死亡フラグ(不要なら消してOK)
    this.dead = false;
    // 逃走中フラグ
    this.isEscaping = false;

    // 最後に動いた方向
    this.lastDir = null;

    // タイル中央への移動先
    this.targetX = this.x;
    this.targetY = this.y;
  }

  update(dt, engine) {
    if (this.dead) return;

    // 速度を決定
    const speed = (this.isEscaping ? this.escapeSpeed : this.baseSpeed);

    // まずタイル中央への途中移動かどうかを確認
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const remain = Math.hypot(dx, dy);

    if (remain > 1) {
      // (A) まだ次タイルの中心へ移動中
      const ux = dx / remain;
      const uy = dy / remain;
      const moveDist = speed * dt;
      if (moveDist >= remain) {
        // 一気に到着
        this.x = this.targetX;
        this.y = this.targetY;
      } else {
        // 途中まで進む
        this.x += ux * moveDist;
        this.y += uy * moveDist;
      }
    } else {
      // (B) ちょうどタイル中央にいる → 次のタイルを決定する
      const player = engine.objects.find(o => o instanceof Player);
      let dir = null;
      if (player) {
        // マンハッタン距離で8タイル以内かどうか
        const distManhattan = Math.abs(player.col - this.col) + Math.abs(player.row - this.row);
        if (distManhattan <= 8) {
          if (this.isEscaping) {
            // 逃走ロジック: プレイヤーから離れるタイルへ
            dir = this.decideAwayFromPlayer(engine, player) || this.randomDir(engine);
          } else {
            // 通常ロジック: プレイヤーに近づく BFS
            dir = this.decideDirectionBFS(engine, player, /*isEscaping=*/false) 
               || this.randomDir(engine);
          }
        } else {
          // プレイヤー遠い → 適当にランダム or 従来の BFS など
          dir = this.randomDir(engine);
        }
      } else {
        // プレイヤーいない → ランダム
        dir = this.randomDir(engine);
      }

      // 決まった方向で移動できるかチェック
      const chosen = this.pickValidDirection(dir, engine);
      if (!chosen) {
        // その方向がダメ → ランダム再試行
        const alt = this.randomDir(engine);
        const altRes = this.pickValidDirection(alt, engine);
        if (!altRes) {
          // 全部ダメ → 移動しない
          return;
        } else {
          this.lastDir = alt;
          this.col = altRes.c;
          this.row = altRes.r;
          this.targetX = altRes.tx;
          this.targetY = altRes.ty;
        }
      } else {
        // OK
        this.lastDir = dir;
        this.col = chosen.c;
        this.row = chosen.r;
        this.targetX = chosen.tx;
        this.targetY = chosen.ty;
      }
    }
  }

  /**
   * pickValidDirection()
   * 決まった方向 dir ("left","right","up","down") に対し、
   *  - 壁判定
   *  - 敵との近すぎ判定
   * を行い、OKなら { c, r, tx, ty } を返し、NGなら null。
   */
  pickValidDirection(dir, engine) {
    if (!dir) return null;
    const tileSize = 32;
    let dc = 0, dr = 0;
    if (dir === "left")  dc = -1;
    if (dir === "right") dc =  1;
    if (dir === "up")    dr = -1;
    if (dir === "down")  dr =  1;

    const nc = this.col + dc;
    const nr = this.row + dr;
    const tx = nc * tileSize + 16;
    const ty = nr * tileSize + 16;

    // (1) 壁チェック
    if (engine.gameMap.isWall(tx, ty)) {
      return null;
    }
    // (2) 他の敵と近すぎないかチェック
    if (!this.checkEnemyDistance(nc, nr, engine)) {
      return null;
    }
    // OK
    return { c: nc, r: nr, tx, ty };
  }

  /**
   * checkEnemyDistance(nc,nr) → trueならOK, falseならNG
   * 同じ or 隣接タイルに敵がいたら回避
   */
  checkEnemyDistance(nc, nr, engine) {
    for (const obj of engine.objects) {
      if (obj instanceof Enemy && obj !== this && !obj.dead) {
        // obj.col, obj.row と nc,nr が同じ / 隣接ならダメ
        const distC = Math.abs(obj.col - nc);
        const distR = Math.abs(obj.row - nr);
        if (distC <= 1 && distR <= 1) {
          // 近すぎ
          return false;
        }
      }
    }
    return true;
  }

  /** 
   * decideAwayFromPlayer()
   * プレイヤーから遠ざかる方向を BFS distance で決定
   */
  decideAwayFromPlayer(engine, player) {
    // BFS で [player.col,player.row] からの距離マップを構築
    const distMap = this.buildDistanceMapFromPlayer(engine, player);

    // 自分の col,row の隣マスをチェック
    const cands = [
      ["left",  -1, 0],
      ["right", 1, 0],
      ["up",    0, -1],
      ["down",  0, 1],
    ];
    let bestDir = null;
    let bestDist = -9999;

    for (const [dir, dc, dr] of cands) {
      const nc = this.col + dc;
      const nr = this.row + dr;
      const key = `${nc},${nr}`;
      const val = distMap[key];
      if (val !== undefined) {
        // val が大きいほど遠い → より良い
        if (val > bestDist) {
          bestDist = val;
          bestDir = dir;
        }
      }
    }
    return bestDir;
  }

  /** 
   * buildDistanceMapFromPlayer()
   * player.col,player.row から各タイルへの最短手数を BFS で求める
   * distMap["col,row"] = steps
   */
  buildDistanceMapFromPlayer(engine, player) {
    const tileSize = 32;
    const start = { c: player.col, r: player.row };
    const distMap = {};
    distMap[`${start.c},${start.r}`] = 0;

    const queue = [start];
    const visited = new Set();
    visited.add(`${start.c},${start.r}`);

    const directions = [
      [1,0],[-1,0],[0,1],[0,-1]
    ];

    while (queue.length>0) {
      const cur = queue.shift();
      const curDist = distMap[`${cur.c},${cur.r}`];

      for (const [dx,dy] of directions) {
        const nc = cur.c + dx;
        const nr = cur.r + dy;
        const key = `${nc},${nr}`;
        if (visited.has(key)) continue;

        const tx = nc*tileSize + 16;
        const ty = nr*tileSize + 16;
        // 壁
        if (engine.gameMap.isWall(tx,ty)) continue;

        visited.add(key);
        queue.push({ c:nc, r:nr });
        distMap[key] = curDist+1;
      }
    }

    return distMap;
  }

  /**
   * decideDirectionBFS()
   * プレイヤーに近づく方向を BFS で決定 (省略してたが最後まで実装)
   * isEscaping=false の場合のみここで使う
   */
  decideDirectionBFS(engine, player, isEscaping) {
    const start = { c: this.col, r: this.row };
    const goal  = { c: player.col, r: player.row };
    const tileSize = 32;

    const queue = [start];
    const visited = new Set();
    visited.add(`${start.c},${start.r}`);

    // 「来た場所」を覚え、あとで逆順に追う
    const prev = {};
    prev[`${start.c},${start.r}`] = null;

    const dirs = [
      ["left", -1, 0],
      ["right",1, 0],
      ["up",   0, -1],
      ["down", 0,  1],
    ];

    // BFS
    while (queue.length>0) {
      const cur = queue.shift();
      if (cur.c === goal.c && cur.r === goal.r) {
        // 到達 → 経路復元
        return this.reconstructFirstMove(cur, prev);
      }
      for (const [dName,dc,dr] of dirs) {
        const nc = cur.c + dc;
        const nr = cur.r + dr;
        const key = `${nc},${nr}`;
        if (!visited.has(key)) {
          const tx = nc*tileSize + 16;
          const ty = nr*tileSize + 16;
          if (!engine.gameMap.isWall(tx,ty)) {
            visited.add(key);
            queue.push({ c:nc, r:nr });
            prev[key] = `${cur.c},${cur.r}`;
          }
        }
      }
    }
    // 見つからなかった → null
    return null;
  }

  /**
   * BFS経路をたどり、最初の一手 (left,right,up,down) を返す
   */
  reconstructFirstMove(cur, prev) {
    let nodeKey = `${cur.c},${cur.r}`;
    const path = [];
    // ゴールからスタートへ遡りつつ配列先頭へ追加
    while (nodeKey) {
      path.unshift(nodeKey);
      nodeKey = prev[nodeKey];
    }
    // path[0] がスタート, path[1] が次タイル
    if (path.length < 2) return null;

    const [sC,sR] = path[0].split(",").map(Number);
    const [nC,nR] = path[1].split(",").map(Number);

    if (nC < sC) return "left";
    if (nC > sC) return "right";
    if (nR < sR) return "up";
    if (nR > sR) return "down";
    return null;
  }

  /**
   * randomDir()
   * lastDir と逆方向を除外してランダムに決定
   */
  randomDir(engine) {
    const possible = ["left","right","up","down"];
    // 直前の逆方向を避ける
    let opposite = null;
    if (this.lastDir==="left")  opposite="right";
    if (this.lastDir==="right") opposite="left";
    if (this.lastDir==="up")    opposite="down";
    if (this.lastDir==="down")  opposite="up";

    // 壁でない4方向を候補に
    const good = [];
    for(const d of possible){
      if(d===opposite) continue; // 同じ道を戻りたくない
      const dc = (d==="left"? -1 : d==="right"?1 :0);
      const dr = (d==="up"? -1 : d==="down"?1 :0);

      const nc = this.col + dc;
      const nr = this.row + dr;
      const tx = nc*32 +16;
      const ty = nr*32 +16;
      if(!engine.gameMap.isWall(tx,ty)){
        good.push(d);
      }
    }
    if(good.length>0){
      return good[Math.floor(Math.random()*good.length)];
    } else {
      // どこも行けない時
      return possible[Math.floor(Math.random()*possible.length)];
    }
  }

  draw(ctx, engine) {
    if (this.dead) return;
    const eImg = engine.images["enemy"];
    if (eImg) {
      ctx.drawImage(eImg, this.x - 16, this.y - 16, 32, 32);
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x - 8, this.y - 8, 16, 16);
    }
  }
}
