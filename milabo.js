const videoIDs = [
    "I88PrE-KUPk?si=FNudarP0yvEdtj0G",
];
const randomIndex = Math.floor(Math.random() * videoIDs.length);
const chosenID = videoIDs[randomIndex];

const iframe = document.getElementById("youtube-iframe");
iframe.src = "https://www.youtube.com/embed/" + chosenID + "?autoplay=1&mute=1";



