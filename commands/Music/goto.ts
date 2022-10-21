import RFCommand from "../commandClass";
import { ApplicationCommandOptionType, Client, ChatInputCommandInteraction, GuildMember } from "discord.js";
import { joinVoiceChannel } from "@discordjs/voice";
import { config } from "../../modules/config";
import Queue, { queueMapType } from "../../musicHandler/queue";
import { basicEmbed, colorPalette } from "../../modules/responses";

export default class GotoCommand extends RFCommand {
    constructor(client: Client) {
        super(client)
    }

    slashInfo = {
        name: 'goto',
        description: "🔑 Ir a una pista en la cola.",
        options: [
            {
                name: "position",
                description: "La posición en la cola de la pista a la que se va a ir.",
                type: ApplicationCommandOptionType.Integer,
                required: true
            },
        ]
    }

    async callback(interaction: ChatInputCommandInteraction, config: config, queueMap: queueMapType) {
        return new Promise(async (res, rej) => {

            const guild = interaction.guild
            const position = interaction.options.getInteger('position') - 1
            
            const result = await new Queue(interaction.client, queueMap).goto(guild.id, position, true, true)

            if (result) {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xdda:1013896171409907783> Fue a la pista ${"`"}${position + 1}${"`"}.\n<:xdda:1013161845873442877>｜Poniendo ahora: [${result.title}](${result.source}) by ${"`"}${result.author}${"`"}.`, colorPalette.trackOperation ) ] })
            } else {
                return interaction.editReply({ embeds: [ basicEmbed( `<:xxdda:1013162318764449883> No se puede ir a esa pista.`, colorPalette.error ) ] })
            }
            

        })
    }
}
