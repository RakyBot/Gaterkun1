import { Client, ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { queueMapType } from "../musicHandler/queue";

type slashInfoType = {
    name: string,
    description: string,
    options?: {
        name: string,
        description: string,
        type: string | ApplicationCommandOptionType,
        required?: boolean
    }[]
}

export default class RFCommand {
    client: Client

    constructor(client: Client) {
        this.client = client
    }

    slashInfo = {} as slashInfoType
    
    callback(interaction: ChatInputCommandInteraction, config: any, queueMap: queueMapType) {

    }
}
