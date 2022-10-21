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
        description: "🎹 Quitrar pause del bot de música.",
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const result = await new Queue(interaction.client, queueMap).resume(guild.id)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013160472415047710> Volver a poner.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `<:aa:1013165735431901276> La musica no está en pausa.`, colorPalette.error ) ] })
            }

        })
    }
}
