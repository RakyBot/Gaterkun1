import { ChannelType, Client, GatewayIntentBits, PermissionsBitField, Snowflake } from 'discord.js'
import * as dotenv from 'dotenv'
    dotenv.config()
import CommandHandler from './modules/commandHandler'
import Queue, { QueueEntry } from './musicHandler/queue'
//import loadManager from './musicHandler/loadManager'
import queuePageButtons from './modules/queuePages'
import PrivateVC from './modules/privateVC'
import Config from './modules/config'
import timeout from './modules/autoTimeout'
import joinChannel from './events/joinChannel'


const client = new Client({ intents: [GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers] })


client.on('ready', async () => {
    
    console.log(`Logged in as ${client.user.username}!`);

    const queueMap: Map<Snowflake, QueueEntry> = new Map()

    // Initialize Modules
    await new Queue(client, undefined).init(queueMap);
   //await loadManager.checkLoop(client, new Queue(client, queueMap));
    await new CommandHandler(client).init();


    
    client.on('interactionCreate', interaction => {
        if (interaction.isChatInputCommand() && interaction.inGuild()) {

            new CommandHandler(client).handler(interaction, queueMap);

        } else if (interaction.isButton() && interaction.inGuild()) {

            queuePageButtons(interaction, queueMap).catch(() => {});
            
        }

        return;
    })

    client.on('guildCreate', async (guild) => {

        const queue = new Queue(client, queueMap)

        await queue.initGuild(guild.id)
        //await loadManager.addGuild(client, queue, guild.id)

        return;
        
    })

    client.on('voiceStateUpdate', async (oldState, newState) => {
        new PrivateVC(client, oldState, newState).update().catch((err) => { return; });

        timeout(client, oldState, newState)
        joinChannel(client, queueMap, oldState, newState)
    })

    client.on('channelUpdate', async (oldChannel, newChannel) => {

        if (oldChannel.type == ChannelType.GuildVoice && newChannel.type == ChannelType.GuildVoice) {
            const guildId = newChannel.guildId
            const config = await new Config(guildId).get().catch((err) => { throw(err); })

            if (config.allowMassPingVCChannel) return; // Don't block mass ping permissions if the config allows it.

            if (newChannel.parentId == config.vcCategory) {

                if (newChannel.permissionOverwrites != oldChannel.permissionOverwrites) {

                    let newPermissionsPayload = []

                    for (const [Id, permissions] of newChannel.permissionOverwrites.cache.entries()) {
                        const allowBitPermissions = new PermissionsBitField(permissions.allow);
                        const denyBitPermissions = new PermissionsBitField(permissions.deny);

                        let payload = {
                            id: Id,
                            allow: allowBitPermissions,
                            deny: denyBitPermissions,
                            skip: undefined,
                        }

                        if (!allowBitPermissions.has("MentionEveryone") && denyBitPermissions.has("MentionEveryone")) payload.skip = true;
        
                        allowBitPermissions.remove("MentionEveryone")
                        denyBitPermissions.add("MentionEveryone")

                        newPermissionsPayload.push(payload)
        
                    }
        
                    let skipCounter = 0
                    for (const entry of newPermissionsPayload) {
                        if (entry.skip) skipCounter++
                    }

                    if (skipCounter == newPermissionsPayload.length) return; // Prevent Infinite Loops
                    await newChannel.permissionOverwrites.set(newPermissionsPayload).catch((err) => { console.error(err); return; })

                }

            }

        }

    })

})

client.login(process.env.TOKEN);
