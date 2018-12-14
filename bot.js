const discord = require('discord.js');
var config = require('./config.json');
const fs = require('fs');
const utils = require('./utils');
const database = require("./database");
const youtube = require("ytdl-core");

const client = new discord.Client();


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
                     console.log(result);
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

                                    utils.songLengthAsync("song.mp3").then(length => {
                                        length = parseInt(length.toString().replace(".",""));
                                        utils.randomSongTime(length).then(random => {
                                          utils.millisToMinutesAndSeconds(random).then(timeInMS => {

                                            
                                            // const stream = fs.createReadStream(config.songsPath + "song.mp3");
                                            // const streamOptions = { seek: timeInMS, passes: 2, bitrate: "auto" };
                                            // const streamPlay = connection.playStream(stream, streamOptions); 

                                            // setTimeout(() => {
                                            //     streamPlay.end();
                                            //     youtubeSong.destroy();
                                                
                                            //     //stream.destroy();
                                            //     const embedMessage = new discord.RichEmbed();
                                            //     embedMessage.setColor(0xFF0000);
                                            //     embedMessage.setTitle("Time to guess");
                                            //     embedMessage.setDescription("!guess b to guess the band - 1 point \n \
                                            //                             !guess s to guess the song - 2 points\n \
                                            //                             !guess sb to guess the song and the band - 3 points");
                                            //                             message.channel.send(embedMessage)},5000)
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



