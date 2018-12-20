const discord = require('discord.js');
var config = require('./config.json');
const fs = require('fs');
const utils = require('./utils');
const database = require("./database");

const client = new discord.Client();

var songGlobal = null;
var guessAttempts = 0;

client.on('ready', () => {
    console.log("logged in as " + client.user.tag);
})

client.on('message', message => {

    if (message.content.startsWith(config.prefix)) {

        var tmp = message.content.split(" ");

        if (tmp != undefined && tmp != null) {

            if (tmp[1] === "update") {
                //database.updateUser(message.member.id,message.member.displayName);
                database.getSongs().then(result => {
                    var song = utils.getRandomSong(result);

                })
            }

            if (tmp[1] === "ranking") {
                database.getAllUsers().then(users => {
                    var mensagem = "";
                    if (users && users.length > 0) {
                        for (let i = 0; i < users.length; i++) {
                            if (users[i].id == message.member.id) {
                                mensagem += i + 1 + " - " + message.author.toString() + "  -  " + users[i].score + "\n";
                            } else {
                                mensagem += i + 1 + " - " + users[i].name + "  -  " + users[i].score + "\n";
                            }
                        }
                    } else {
                        mensagem = "No users";
                    }
                    let embed = {
                        "title": "-----------RANKING----------",
                        "color": 7505801,
                        // "thumbnail": {
                        //   "url": "https://cdn.discordapp.com/embed/avatars/0.png"
                        // },
                        "author": {
                            "name": "Guess Bot",
                            "icon_url": "https://www.iconsdb.com/icons/preview/orange/trophy-2-xxl.png"
                        },
                        "description": mensagem
                    };


                    console.log(mensagem);
                    let embedMessage = new discord.RichEmbed();
                    embedMessage.setAuthor("Guess Bot", "");
                    embedMessage.setTitle("----------RANKING----------");

                    embedMessage.setDescription(mensagem);
                    embedMessage.setColor(0x00DDDD);
                    message.channel.send({ embed });
                })
                    .catch(error => {
                        console.log(error);
                    })

            }

            if (tmp[1] === "time") {
                utils.songLengthAsync("song.mp3").then(length => {
                    length = parseInt(length.toString().replace(".", ""));
                    utils.randomSongTime(length).then(random => {

                        let timeInMS = utils.millisToMinutesAndSeconds(random);
                        timeInMS.then(x => {
                            console.log(x);
                        })
                        // const stream = fs.createReadStream(config.songsPath + "song.mp3");
                        // console.log(stream.path);
                        // const streamOptions = { seek: timeInMS, passes: 2, bitrate: "auto" };
                        // const tmp = connection.playStream(stream, streamOptions);
                        console.log("aqui2");
                        //database.insertUser(message.member.user.id,message.member.displayName,0);
                        //database.updateUser(message.member.user.id,message.member.displayName,5);

                    })

                }
                )
                    .catch(error => {
                        console.log(error);
                    })

            }

            if (tmp[1] === "play") {

                if (!message.guild) return;

                if (message.member.voiceChannel) {

                    message.member.voiceChannel.join().then(
                        connection => {
                            database.getSongs().then(song => {
                                if (song) {
                                    let songActive = song.filter(x => x.ativo == 1);
                                    var songCurrent = null;
                                    if (songActive.length == 1) {
                                        songCurrent = songActive[0];
                                    } else if (songActive.length == 0) {
                                        songCurrent = utils.getRandomSong(song);
                                        //make song active
                                        database.makeSongActiveOrInactive(1,songCurrent.id);
                                    }

                                    if (songCurrent != null) {
                                        console.log(songCurrent);
                                        utils.songLengthAsync(songCurrent.fileName).then(length => {
                                            lengthRes = parseInt(length.toString().replace(".", ''));
                                            utils.randomSongTime(lengthRes).then(randomTime => {
                                                utils.millisToMinutesAndSeconds(randomTime).then(timeInMS => {
                                                    const stream = fs.createReadStream(config.songsPath + songCurrent.fileName);
                                                    const streamOptions = { seek: timeInMS, passes: 2, bitrate: "auto" };
                                                    const streamPlay = connection.playStream(stream, streamOptions);

                                                    setTimeout(() => {
                                                        streamPlay.end();
                                                        stream.destroy();
                                                        connection.disconnect();
                                                        let embed = utils.embedMessage("Time to guess!", "command < !guess band to guess > the band -> 1 point \n \
                                                        command < !guess album > to guess the album -> 2 points \n \
                                                        command < !guess song > to guess the song -> 3 points \n \
                                                        command < !guess all > to guess the song the album and the band -> 5 points", 0xFF0000);
                                                        message.channel.send(embed);
                                                        songGlobal = songCurrent;
                                                    }, 5000);
                                                })
                                                    .catch(error => {
                                                        console.log(error);
                                                    })
                                                    .catch(error => {
                                                        console.log(error);
                                                    })
                                            })
                                                .catch(error => {
                                                    console.log(error);
                                                })
                                        })
                                            .catch(error => {
                                                console.log(error);
                                            })
                                    }
                                }
                            })
                                .catch(error => {
                                    console.log(error);
                                })
                        })
                } else {
                    message.channel.send(message.author.toString() + ", please join a voice channel first");
                }
            }

            if (tmp[1] === "band") {
                if (tmp.length === 3) {
                    let bandRes = tmp[2].trim().toLowerCase();
                    console.log(bandRes);
                    if (songGlobal != undefined && songGlobal != null) {
                        if (bandRes == songGlobal.bandName || bandRes == songGlobal.bandAbb) {
                            guessAttempts = 0;
                            database.makeSongActiveOrInactive(0,songGlobal.id);
                            database.getUserById(message.member.id).then(user => {
                                if (user) {
                                    let newScore = user[0].score + 1;
                                    database.updateUserScore(message.member.id, message.member.displayName, newScore);
                                }
                            })
                            let embed = utils.embedMessageImage("Band - Correct", "You are a genius, you got 1 point", "3659367", "https://cdn1.iconfinder.com/data/icons/warnings-and-dangers/400/Warning-02-512.png");
                            message.channel.send({ embed });
                            songGlobal = null;

                        } else {
                            if(guessAttempts == 4){
                                guessAttempts = 0;
                                database.makeSongActiveOrInactive(0,songGlobal.id);
                                songGlobal = null;
                                //make song inactive
                            }else{
                                guessAttempts ++;
                            }

                            let embed = utils.embedMessageImage("Band - Wrong", "Nice try but... you got 0 points", "14039350", "https://cdn3.iconfinder.com/data/icons/simple-web-navigation/165/cross-512.png");
                            message.channel.send({ embed });
                        }
                    } else {
                        message.channel.send(message.author.toString() + ", you have to play a song first before you can guess");
                    }
                } else {
                    message.channel.send(message.author.toString() + ", please specify a band name (without spaces)");
                }
            }

            if (tmp[1] === "album") {
                if (songGlobal != undefined && songGlobal != null) {
                    if (tmp.length === 3) {
                        let albumRes = tmp[2].trim().toLowerCase();

                        if (albumRes == songGlobal.albumName || albumRes == songGlobal.albumAbb) {
                            guessAttempts = 0;
                            database.makeSongActiveOrInactive(0,songGlobal.id);
                            database.getUserById(message.member.id).then(user => {
                                if (user) {
                                    let newScore = user[0].score + 2;
                                    database.updateUserScore(message.member.id, message.member.displayName, newScore);
                                }
                            })
                            let embed = utils.embedMessageImage("Album - Correct", "You are a genius, you got 2 points", "3659367", "https://cdn1.iconfinder.com/data/icons/warnings-and-dangers/400/Warning-02-512.png");
                            message.channel.send({ embed });
                            songGlobal = null;
                        } else {
                            if(guessAttempts == 5){
                                guessAttempts = 0;
                                database.makeSongActiveOrInactive(0,songGlobal.id);
                                songGlobal = null;
                            }else{
                                guessAttempts ++;
                            }
                            let embed = utils.embedMessageImage("Album - Wrong", "Nice try but... you got 0 points", "14039350", "https://cdn3.iconfinder.com/data/icons/simple-web-navigation/165/cross-512.png");
                            message.channel.send({ embed });
                        }
                    } else {
                        message.channel.send(message.author.toString() + ", please specify a album name (without spaces)");
                    }
                } else {
                    message.channel.send(message.author.toString() + ", you have to play a song first before you can guess");

                }
            }

            if (tmp[1] === "song") {
                if (songGlobal != undefined || songGlobal != null) {
                    if (tmp.length === 3) {
                        let songRes = tmp[2].trim().toLowerCase();
                        if (songRes == songGlobal.songName) {
                            guessAttempts = 0;
                            database.makeSongActiveOrInactive(0,songGlobal.id);
                            database.getUserById(message.member.id).then(user => {
                                if (user) {
                                    let newScore = user[0].score + 3;
                                    database.updateUserScore(message.member.id, message.member.displayName, newScore);
                                }
                            })
                            let embed = utils.embedMessageImage("Song - Correct", "You are a genius, you got 3 points", "3659367", "https://cdn1.iconfinder.com/data/icons/warnings-and-dangers/400/Warning-02-512.png");
                            message.channel.send({ embed });
                            songGlobal = null;
                        } else {
                            if(guessAttempts == 5){
                                guessAttempts = 0;
                                database.makeSongActiveOrInactive(0,songGlobal.id);
                                songGlobal = null;
                            }else{
                                guessAttempts ++;
                            }
                            let embed = utils.embedMessageImage("Song - Wrong", "Nice try but... you got 0 points", "14039350", "https://cdn3.iconfinder.com/data/icons/simple-web-navigation/165/cross-512.png");
                            message.channel.send({ embed });
                        }
                    } else {
                        message.channel.send(message.author.toString() + ", please specify a song name (without spaces)");
                    }
                } else {
                    message.channel.send(message.author.toString() + ", you have to play a song first before you can guess");
                }
            }

            if (tmp[1] === "all") {
                if (songGlobal != undefined && songGlobal != null) {
                    if (tmp.length === 5) {
                        let songRes = tmp[2].trim().toLowerCase();
                        let albumRes = tmp[3].trim().toLowerCase();
                        let bandRes = tmp[4].trim().toLowerCase();
                        if (songGlobal.songName == songRes && (songGlobal.albumName == albumRes || songGlobal.albumAbb == albumRes) && (songGlobal.bandName == bandRes || songGlobal.bandAbb == bandRes)) {
                            guessAttempts = 0;
                            database.makeSongActiveOrInactive(0,songGlobal.id);
                            database.getUserById(message.member.id).then(user => {
                                if (user) {
                                    let newScore = user[0].score + 5;
                                    database.updateUserScore(message.member.id, message.member.displayName, newScore);
                                }
                            })
                            let embed = utils.embedMessageImage("All - Correct", "You are a GOD, you got 5 points", "3659367", "https://cdn1.iconfinder.com/data/icons/warnings-and-dangers/400/Warning-02-512.png");
                            message.channel.send({ embed });
                            songGlobal = null;

                        } else {
                            if(guessAttempts == 5){
                                guessAttempts = 0;
                                database.makeSongActiveOrInactive(0,songGlobal.id);
                                songGlobal = null;
                            }else{
                                guessAttempts ++;
                            }
                            let embed = utils.embedMessageImage("All - Wrong", "Nice try but... you got 0 points", "14039350", "https://cdn3.iconfinder.com/data/icons/simple-web-navigation/165/cross-512.png");
                            message.channel.send({ embed });
                        }
                    } else {
                        message.channel.send(message.author.toString() + ", please specify the information in the order of songName albumName bandName");
                    }
                } else {
                    message.channel.send(message.author.toString() + ", you have to play a song first before you can guess");
                }
            }
        }
    }

    // If the message is "how to embed"
    if (message.content === 'how to embed') {
        // We can create embeds using the MessageEmbed constructor
        // Read more about all that you can do with the constructor
        // over at https://discord.js.org/#/docs/main/stable/class/RichEmbed
        const embed = new discord.RichEmbed()
            // Set the title of the field
            .setTitle('A slick little embed')
            // Set the color of the embed
            .setColor(0xFF0000)
            // Set the main content of the embed
            .setDescription('Hello, this is a slick embed!');
        // Send the embed to the same channel as the message
        message.channel.send(embed);
    }


    if (message.content === 'ping') {
        message.channel.send("Pong");

    }
});

client.login(config.token);



