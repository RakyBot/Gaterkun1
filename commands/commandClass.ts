import { Client, CommandInteraction } from "discord.js";
import { queueMapType } from "../musicHandler/queue";

type slashInfoType = {
    name: string,
    description: string,
    options?: {
        name: string,
        description: string,
        type: string,
        required: boolean
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
