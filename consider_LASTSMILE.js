// consider_LASTSMILE.js
document.addEventListener("DOMContentLoaded", () => {
  const paragraphs = document.querySelectorAll(".consider-article p");

  paragraphs.forEach((p) => {
    p.addEventListener("click", () => {
      p.classList.toggle("is-highlight");
    });
  });
});
