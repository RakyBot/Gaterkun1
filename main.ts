import { Client, Intents, Snowflake } from 'discord.js'
import * as dotenv from 'dotenv'
    dotenv.config()
import CommandHandler from './modules/commandHandler'
import Queue, { QueueEntry } from './musicHandler/queue'
import loadManager from './musicHandler/loadManager'


const client = new Client({ intents: [Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILDS] })


client.on('ready', async () => {
    
    console.log(`Logged in as ${client.user.username}!`);

    const queueMap: Map<Snowflake, QueueEntry> = new Map()
    const queue = await new Queue(client, undefined).init(queueMap);
    const loadMananger = await loadManager.checkLoop(client, new Queue(client, queueMap));

    await new CommandHandler(client).init();
    
    client.on('interactionCreate', interaction => {
        if (interaction.isCommand() && interaction.inGuild()) {
            new CommandHandler(client).handler(interaction, queueMap);
            return;
        }
    })

    client.on('guildCreate', (guild) => {
        // Initialize that new server into the bot's queue. (TO DO)
    })

})

client.login(process.env.TOKEN)
