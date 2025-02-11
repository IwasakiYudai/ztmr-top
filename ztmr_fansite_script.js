const videoIDs = [
    "IeyCdm9WwXM?si=HsfG5UhUv-7mPBnm", 
    "04A_3wUR8Cg?si=cCskyw8JWGnqFvqq", 
    "PLG2Uexyi9s?si=QWfkJXyHTNOpsR1s",
    "E8RMWLoAsa0?si=0CqaYGI6-Y4rZw6v",
    "GfDXqY-V0EY?si=st5CVtxj15l3weOI",
    "H88kps8X4Mk?si=pnDwpcj5rhBqZ0rf",
    "SAdkxVFyAyc?si=ZBhJ7lwIyDEXuWlO",
    "e5LaKxJVeVI?si=vAYtIVsvaamCP4kM",
    "6OC92oxs4gA?si=sIOpdmPwWmnKcGy5",
    "Nmemc-b6cdU?si=BmUUUJPHQ6_BKi2E",
    "OxcnK1s2Fww?si=9dV0eCfHq0uUDIlq",
    "BVvvUGP0MFw?si=PyNpbIiaeHEjz1Oc",
    "9PnCSI8ndws?si=sKARbKIX7PPWg4C6",
    "Sfz5TpCRSiI?si=8PjwLg1dFu6DB7NI",
    "YgmFIVOR1-I?si=r412VrzWAyz7SevG",
    "ZUwaudw8ht0?si=dkH-caRbOt9Lqlys",
    "4QePrv24TBU?si=SjsL6RmIFFx9ku95",
    "wQPgM-9LatM?si=a2jWCjU2vcYITdyx",
    "dcOwj-QE_ZE?si=-B4D1Rcx3NI2rMwy",
    "258qUAI7rck?si=AZj79IrCWfS4PwDh",
    "ugpywe34_30?si=89YXSI6iWk0L8D4o",
    "ouLndhBRL4w?si=Wbu0m_5SUG1pykv0",
    "COll6PdtI5w?si=u42QX_aqvpV7Wepi",
    "I88PrE-KUPk?si=FNudarP0yvEdtj0G",
    "Atvsg_zogxo?si=TYDKVLbD8dIayZss",
    "Qw-FSw7d2zE?si=adEqblytON0r2Bxn",
    "ElnxZtiBDvs?si=lJQS1QB7l6AhpO8X",
    "mlA-Z7zSLHU?si=ntuHZzLD9RorfzQ3",
    "iyCRK5WfFOI?si=4h5QuDKIdWTXwSrG",
    "7kUbX4DoZoc?si=KUG_ASbAdPcbYbDi",
    "VJy8qZ77bpE?si=8qhCO-0paS5OUlUT",
    "GAB26GgJ8V8?si=v0t475iS-6EneuYr",
    "GJI4Gv7NbmE?si=09oiVk-IuUZrPdCK"
];

const randomIndex = Math.floor(Math.random() * videoIDs.length);
const chosenID = videoIDs[randomIndex];

const iframe = document.getElementById("youtube-iframe");
iframe.src = "https://www.youtube.com/embed/" + chosenID + "?autoplay=1&mute=1";
