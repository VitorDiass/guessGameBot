const mp3Duration = require("mp3-duration");
const config = require("./config.json");

exports.songLengthAsync = async function (songName){
    var songPath = config.songsPath + songName;
    var duration = await mp3Duration(songPath, function(err,duration){
        if(err) return err.message;
        return duration;
    });

    return duration;
}

exports.randomSongTime = async function(songLength) {
    var startTime = 1000;
    var songLengthFloor = Math.floor(songLength);
    let randomTime = await Math.floor(Math.random() * (Number(songLengthFloor) - Number(startTime +1 ) ) + Number(startTime)); 
    return randomTime;
}

exports.millisToMinutesAndSeconds = function (millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }
 