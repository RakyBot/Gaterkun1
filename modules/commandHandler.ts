import { Client, CommandInteraction, GuildMember } from "discord.js";
import commands from '../commands'
import { queueMapType } from "../musicHandler/queue";
import Config, {config as configOutline} from "./config";

export default class CommandHandler {
    client: Client

    constructor(client: Client) {
        this.client = client
    }

    async init() { // Initialize and update all Slash Commands
        return new Promise(async (resolve, reject) => {

            let slashCommandsSetData: { name: string, description: string}[] = []
            for (const commandClass of commands) {
                const slashInfo = new commandClass(this.client).slashInfo
                slashCommandsSetData.push(slashInfo)
                console.log(slashInfo)
            }

            // Send Commands to Discord
            this.client.application.commands.set(slashCommandsSetData).catch((err) => { throw err; })

            const testGuild = await this.client.guilds.fetch(process.env.TESTGUILD)
                testGuild.commands.set(slashCommandsSetData).catch((err) => { throw err;})

            return resolve(true);

        })
    }

    async handler(interaction: CommandInteraction, queueMap: queueMapType) {
        return new Promise(async (resolve, reject) => {

            await interaction.deferReply({ ephemeral: false }).catch(() => {}) // Hold it until we can resolve whatever command needs to be processed.
            const guild = interaction.guild
            const interactionCommandName = interaction.commandName
            const config = await new Config(guild.id).get().catch(async (err) => { throw err; }) as configOutline

            
            for (const commandClass of commands) {

                const RFCommand = new commandClass(this.client)
                    let commandName = RFCommand.slashInfo.name

                if (interactionCommandName == commandName) {
                    await RFCommand.callback(interaction, config, queueMap).catch((err) => { throw err; })
                    return resolve(true);
                } else {
                    continue;
                }
                
            }

        })
    }
    
}
