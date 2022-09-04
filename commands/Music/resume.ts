import RFCommand from "../commandClass";
import { Client, ChatInputCommandInteraction } from "discord.js";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class ResumeCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'resume',
        description: "Resumes the music bot.",
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const result = await new Queue(interaction.client, queueMap).resume(guild.id)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `▶️｜Resumed.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `🛑｜The queue is not paused.`, colorPalette.error ) ] })
            }

        })
    }
}
