const discord = require('discord.js');
var config = require('./config.json');
const fs = require('fs');
const utils = require('./utils');
const database = require("./database");

const client = new discord.Client();

var songGlobal = null;

client.on('ready',() => {
    console.log("logged in as " + client.user.tag);
})

client.on('message', message => {

    if(message.content.startsWith(config.prefix)){

        var tmp = message.content.split(" ");

        if(tmp != undefined && tmp != null){

             if(tmp[1] === "update"){
                 //database.updateUser(message.member.id,message.member.displayName);
                 database.getSongs().then(result => {
                     var song = utils.getRandomSong(result);

                 })
             }

            if(tmp[1] === "ranking"){
                database.getAllUsers().then(users => {
                     var mensagem = "";
                     if(users && users.length>0){
                         for(let i=0;i<users.length;i++){
                             if(users[i].id == message.member.id){
                                 mensagem += i+1 + " - " + message.author.toString() + "  -  " + users[i].score + "\n";
                             }else{
                             mensagem += i+1 + " - " + users[i].name + "  -  " + users[i].score +"\n";
                             }
                         }
                     }else{
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
                        "description" : mensagem
                      };


                     console.log(mensagem);
                     let embedMessage = new discord.RichEmbed();
                     embedMessage.setAuthor("Guess Bot","");
                     embedMessage.setTitle("----------RANKING----------");   
                     
                     embedMessage.setDescription(mensagem);
                     embedMessage.setColor(0x00DDDD);
                     message.channel.send({embed});
                 })
                 .catch(error => {
                     console.log(error);
                 })
                
            }

            if(tmp[1] === "time"){
                utils.songLengthAsync("song.mp3").then(length => {
                    length = parseInt(length.toString().replace(".",""));
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

            if(tmp[1] === "play"){
             
                if(!message.guild) return;

                if(message.member.voiceChannel){
                    message.member.voiceChannel.join().then(
                                connection => {
                                    database.getSongs().then(result => {
                                        let song = utils.getRandomSong(result);
                                        utils.songLengthAsync(song.fileName).then(length => {
                                            lengthRes = parseInt(length.toString().replace(".",""));
                                            console.log(lengthRes);
                                            utils.randomSongTime(lengthRes).then(random => {
                                                console.log(random);
                                                utils.millisToMinutesAndSeconds(random).then(timeInMS => {
                                                console.log(timeInMS);
                                                const stream = fs.createReadStream(config.songsPath + song.fileName);
                                                const streamOptions = { seek: timeInMS, passes: 2, bitrate: "auto" };
                                                const streamPlay = connection.playStream(stream, streamOptions); 

                                             setTimeout(() => {
                                                 streamPlay.end();                
                                                 stream.destroy();
                                                 connection.disconnect();
                                                 const embedMessage = new discord.RichEmbed();
                                                 embedMessage.setColor(0xFF0000);
                                                 embedMessage.setTitle("Time to guess");
                                                 embedMessage.setDescription("!guess b to guess the band - 1 point \n \
                                                                         !guess s to guess the song - 2 points\n \
                                                                         !guess sb to guess the song and the band - 3 points");

                                                message.channel.send(embedMessage);
                                                songGlobal = song;},5000)
                                              
                                                })
                                          }).catch(error => {consol.log(error)})
                                            }).catch( error => {console.log(error)} )        
                                        })

                                    .catch(error => {
                                        console.log(error);
                                    })
                                }
                    )
                }else{
                    message.channel.send(message.author.toString() + ", please join a voice channel first");
                }
            }

            if(tmp[1] === "band"){
                if(tmp.length === 3){
                    let bandRes = tmp[2].trim().toLowerCase();
                    console.log(bandRes);
                    if(songGlobal !== undefined && songGlobal !== null){
                        if(bandRes == songGlobal.bandName || bandRes == songGlobal.bandAbb){
                            database.getUserById(message.member.id).then(user => {
                                if(user){
                                let newScore = user[0].score + 1;
                                database.updateUserScore(message.member.id,message.member.displayName,newScore);
                                }
                            })
                            let embed = utils.embedMessageImage("Band - Correct", "You are a genius, you got 1 point","3659367","https://cdn1.iconfinder.com/data/icons/warnings-and-dangers/400/Warning-02-512.png");
                            message.channel.send({embed});

                        }else{
                            let embed = utils.embedMessageImage("Band - Wrong", "Nice try but... you got 0 points","14039350","https://cdn3.iconfinder.com/data/icons/simple-web-navigation/165/cross-512.png");
                            message.channel.send({embed});
                        }
                    }else{
                        message.channel.send(message.author.toString() + ", you have to play a song first before you can guess the band");
                    }
                }else{
                    message.channel.send(message.author.toString() + ", please specify a band name (without spaces)");
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

   
     if(message.content === 'ping'){
        message.channel.send("Pong");
     }
  });



client.login(config.token);



