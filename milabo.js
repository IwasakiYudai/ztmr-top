const videoIDs = [
    "I88PrE-KUPk?si=FNudarP0yvEdtj0G",
];
const randomIndex = Math.floor(Math.random() * videoIDs.length);
const chosenID = videoIDs[randomIndex];

const iframe = document.getElementById("youtube-iframe");
iframe.src = "https://www.youtube.com/embed/" + chosenID + "?autoplay=1&mute=1";



// 「ゲームをシェア」ボタンを取得
const shareBtn = document.getElementById("twitterShareBtn");
if (shareBtn) {
  shareBtn.addEventListener("click", () => {
    // ツイート本文 (text), URL, ハッシュタグをURLエンコードした上でセット
    const text     = encodeURIComponent("MILABO SCROLL COLLECTORで遊ぼう！   ずとまろげーむ第1弾  対よろです(こちらは非公式ファンメイドサイトです)"); 
    const shareUrl = encodeURIComponent("https://hasebebebe.jp/milabo.html");
    const hashtags = encodeURIComponent("ずとまろ,ソウルラッシュ,ずとまろゲーム,MILABO,ずとまよファンアート");
    // ↑ 好きな文言やタグに書き換えてください

    // intent/tweet のURL
    const twitterIntentUrl = `https://x.com/intent/post?text=${text}&url=${shareUrl}&hashtags=${hashtags}`;

    // 別タブ(または別ウィンドウ)で開く
    window.open(twitterIntentUrl, "_blank");
  });
}

const backToMenuBtn = document.getElementById("backToMenuBtn");
if (backToMenuBtn) {
  backToMenuBtn.addEventListener("click", () => {
    // 同じフォルダに "ztmr_fansite_index.html" がある場合
    window.location.href = "ztmr_fansite_index.html";
  });
}

