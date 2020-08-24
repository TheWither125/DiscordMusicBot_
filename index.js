const { Client } = require('discord.js')
const ytdl = require('ytdl-core')
const PREFIX = '?' 

const client = new Client({ disableEveryone: true})

client.on('ready', () => console.log('Active'))

client.on('message', async message => {
    if(message.author.bot) return
    if(!message.content.startsWith(PREFIX)) return

    const args = message.content.substring(PREFIX.length).split(" ")

    if(message.content.startsWith('${PREFIX}play')) {
        const voiceChannel = message.member.voice.channel
        if(!voiceChannel) return message.channel.send("You need to be in a voice channel to play music")
        const permissions = voiceChannel.permissionsFor(message.client.user)
        if(!permissions.has('CONNECT')) return message.channel.send("I dont have permissions to connect to the voice channel")
        if(!permissions.has('SPEAK')) return message.channel.send("I dont have permissions to speak in the channel") 

        try {
            var connection = await voiceChannel.join()
        } catch (error) {
            console.log('There was an error connecting to the voice channel: ${error}')
            return message.channel.send('There was an error connecting to the voice channel: ${error}')
        }

        const dispatcher = connection.play(ytdl(args[1]))
        .on('finish', () => {
            voiceChannel.leave()
        })
        .on('error', error => {
            console.log(error)
        })
        dispatcher.setVolumeLogarithmic(5 / 5)
    } else if(message.content.startsWith('${PREFIX}stop')) {
        if(!message.member.voice.channel) return message.channel.send("You need to be in voice channel to stop the music")
        message.member.voice.channel.leave()
        return undefined
    }
})

client.login(process.env.token);


