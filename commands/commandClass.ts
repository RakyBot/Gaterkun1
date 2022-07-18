import { Client, CommandInteraction } from "discord.js";
import { ApplicationCommandOptionTypes } from "discord.js/typings/enums";
import { queueMapType } from "../musicHandler/queue";

type slashInfoType = {
    name: string,
    description: string,
    options?: {
        name: string,
        description: string,
        type: string | ApplicationCommandOptionTypes,
        required?: boolean
    }[]
}

export default class RFCommand {
    client: Client

    constructor(client: Client) {
        this.client = client
    }

    slashInfo = {} as slashInfoType
    
    callback(interaction: CommandInteraction, config: any, queueMap: queueMapType) {

    }
}
