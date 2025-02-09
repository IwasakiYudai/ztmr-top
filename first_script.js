// ページが読み込まれたら実行される
window.addEventListener("DOMContentLoaded", () => {
    // ボタンを取得
    const helloBtn = document.getElementById("helloBtn");

    // ボタンがクリックされたときの処理
    helloBtn.addEventListener("click", () => {
        alert("Hello! はじめてのサイトへようこそ!");
    });
});
