const mp3Duration = require("mp3-duration");
const config = require("./config.json");
const discord = require("discord.js");

exports.songLengthAsync = async function (songName){
    var songPath = config.songsPath + songName;
    var duration = await mp3Duration(songPath, function(err,duration){
        if(err) return err.message;
        return duration;
    });

    return duration;
}

exports.randomSongTime = async function(songLength) {
    var startTime = 10000;
    var songLengthFloor = Math.floor(songLength);
    let randomTime = await Math.floor(Math.random() * (songLengthFloor - startTime + 1) + startTime) - 5000; 
    return randomTime;
}

exports.millisToMinutesAndSeconds = async function (millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    var res = await minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    return res;
  }
 
exports.getRandomSong =  function(songObj){
    if(songObj != null && songObj != undefined){
       let songsId = [];

      songObj.forEach(res => songsId.push(res.id));

      let result = songsId[Math.floor(Math.random() * songsId.length)];
    
      let res = songObj.filter(x => x.id == result);

      return res.length > 0 ? res[0] : {};

    }
}

exports.embedMessage = function(title,description,color){
    const embedMessage = new discord.RichEmbed();
    embedMessage.setColor(color);
    embedMessage.setTitle(title);
    embedMessage.setDescription(description);

    return embedMessage;
} 

exports.embedMessageImage = function(title,description,color,imageURL){
    let embed = {
        "title": title,
        "color": color,
        // "thumbnail": {
        //   "url": "https://cdn.discordapp.com/embed/avatars/0.png"
        // },
        "author": {
          "name": "Guess Bot",
          "icon_url": imageURL
        },
        "description" : description
      };

      return embed;
}
