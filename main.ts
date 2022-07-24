import { Client, Intents, Snowflake } from 'discord.js'
import * as dotenv from 'dotenv'
    dotenv.config()
import CommandHandler from './modules/commandHandler'
import Queue, { QueueEntry } from './musicHandler/queue'
import loadManager from './musicHandler/loadManager'
import queuePageButtons from './modules/queuePages'
import PrivateVC from './modules/privateVC'


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

        } else if (interaction.isButton() && interaction.inGuild()) {

            queuePageButtons(interaction, queueMap).catch(() => {});
            
        }

        return;
    })

    client.on('guildCreate', async (guild) => {

        const queue = new Queue(client, queueMap)

        await queue.initGuild(guild.id)
        await loadManager.addGuild(client, queue, guild.id)

        return;
        
    })

    client.on('voiceStateUpdate', async (oldState, newState) => {
        new PrivateVC(client, oldState, newState).update().catch(() => {});
    })

})

client.login(process.env.TOKEN)
