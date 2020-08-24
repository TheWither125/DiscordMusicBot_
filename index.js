const { Client } = require('discord.js')
const ytdl = require('ytdl-core')
const PREFIX = '?' 

const client = new Client({ disableEveryone: true})

const queue = new Map()

client.on('ready', () => console.log('Active'))

client.on('message', async message => {
    if(message.author.bot) return
    if(!message.content.startsWith(PREFIX)) return

    const args = message.content.substring(PREFIX.length).split(" ")
    const serverQueue = queue.get(message.guild.id)

    if(message.content.startsWith(`${PREFIX}play`)) {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send("You need to be in a voice channel to play music")
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has('CONNECT')) return message.channel.send("I dont have permissions to connect to the voice channel")
        if(!permissions.has('SPEAK')) return message.channel.send("I dont have permissions to speak in the channel") 

        const songInfo = await ytdl.getInfo(args[1])
        const song = {
            title: songInfo.videoDetails.title,
            url: songInfo.videoDetails.video_url
        }

        if(!serverQueue) {
            const queueConstruct = {
                textChannel: message.channel,
                voiceChannel: voiceChannel,
                connection: null,
                song: [],
                volume: 5,
                playing: true
            }
            queue.set(message.guild.id, queueConstruct)

            queueConstruct.songs.push(song)
        
            try {
                var connection = await voiceChannel.join()
                queueConstruct.connection = connection
                play(message.guild, queueConsruct.songs[0])
            } catch (error) {
                console.log(`There was an error connecting to the voice channel: ${error}`)
                queue.delete(message.guild.id)
                return message.channel.send(`There was an error connecting to the voice channel: ${error}`)
            }
       } else {
           serverQueue.songs.push(song)
           return message.channel.send(`**${song.title}** has been added to the queue`)
       }
       return undefined
    } else if(message.content.startsWith(`${PREFIX}stop`)) {
        if(!message.member.voice.channel) return message.channel.send("You need to be in voice channel to stop the music")
        if(!serverQueue) return message.channel.send("There is nothing playing")
        serverQueue.songs = []
        serverQueue.connection.dispatcher.end()
        message.channel.send("Music stoped")
        return undefined
    } else if (message.content.startsWith(`${PREFIX}skip`)) {
        if(!message.member.voice.channel) return message.channel.send("You need to be in a voice channel to skip the music")
        if(!serverQueue) return message.channel.send("There is nothing playing")
        serverQueue.connection.dispatcher.end()
        message.channel.send("Music skipped")
        return undefined
    }
})

function play(guild, song) {
    const serverQueue = queue.get(guild.id)

    if(!song) {
        serverQueue.voiceChannel.leave()
        queue.delete(guild.id)
        return
    }

    const dispatcher = serverQueue.connection.play(ytdl(song.url))
     .on('finish', () => {
        serverQueue.songs.shift()
        play(guild, serverQueue.songs[0])
    })
    .on('error', error => {
            console.log(error)
    })
    dispatcher.setVolumeLogarithmic(serverQueue.volume / 5)
}

client.login(process.env.token);


