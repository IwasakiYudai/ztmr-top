const videoIDs = [
    "IeyCdm9WwXM?si=Eu8WgUM4Xx7x4pYo",
    "6OC92oxs4gA?si=HHb2x4yg3LUKev7O"
];

const randomIndex = Math.floor(Math.random() * videoIDs.length);
const chosenID = videoIDs[randomIndex];

const iframe = document.getElementById("youtube-iframe");
iframe.src = "https://www.youtube.com/embed/" + chosenID;
