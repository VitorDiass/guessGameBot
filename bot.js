const discord = require('discord.js');
var config = require('./config.json');
const fs = require('fs');
const utils = require('./utils');
const database = require("./database");

const client = new discord.Client();


client.on('ready',() => {
    console.log("logged in as " + client.user.tag);
})

client.on('message', message => {

    if(message.content.startsWith(config.prefix)){

        var tmp = message.content.split(" ");

        if(tmp != undefined && tmp != null){

            if(tmp[1] === "ranking"){
                console.log(database.getAllUsers());
                // .then(users => {
                //     var mensagem = "";
                //     if(users && users.length>0){
                //         for(let i=0;i<users.length;i++){
                //             mensagem += i+1 + " - " + users.name + " - " + users.score +"\n";
                //         }
                //     }else{
                //         mensagem = "No users";
                //     }
                //     let embedMessage = new discord.RichEmbed();
                //     embedMessage.setTitle("RANKING");
                //     embedMessage.setDescription(mensagem);
                //     embedMessage.setColor(0xFF0000);

                //     message.channel.send(embedMessage);
                // })
                // .catch(error => {
                //     console.log(error);
                // })

            }

            if(tmp[1] === "time"){
                utils.songLengthAsync("song.mp3").then(length => {
                    length = parseInt(length.toString().replace(".",""));
                    utils.randomSongTime(length).then(random => {
                        console.log(random);
                        let timeInMS = utils.millisToMinutesAndSeconds(random);
                        console.log(timeInMS);
                        // const stream = fs.createReadStream(config.songsPath + "song.mp3");
                        // console.log(stream.path);
                        // const streamOptions = { seek: timeInMS, passes: 2, bitrate: "auto" };
                        // const tmp = connection.playStream(stream, streamOptions);
                        console.log("aqui2");      
                        database.insertUser(message.member.user.id,message.member.displayName,0);
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
                                            let timeInMS = utils.millisToMinutesAndSeconds(random);
                                            console.log(timeInMS);
                                            const stream = fs.createReadStream(config.songsPath + "song.mp3");
                                            const streamOptions = { seek: timeInMS, passes: 2, bitrate: "auto" };
                                            const streamPlay = connection.playStream(stream, streamOptions); 
                                            setTimeout(() => {
                                                streamPlay.end();
                                                stream.destroy();
                                                const embedMessage = new discord.RichEmbed();
                                                embedMessage.setColor(0xFF0000);
                                                embedMessage.setTitle("Time to guess");
                                                embedMessage.setDescription("!guess b to guess the band - 1 point \n \
                                                                        !guess s to guess the song - 2 points\n \
                                                                        !guess sb to guess the song and the band - 3 points");
                                                                        message.channel.send(embedMessage)},5000)
                                            
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



