import * as fs from 'fs/promises'
const configsPath = './configs'

export type config = {
    vcCategory: string,
    createVC: string,
    privateVC: boolean,
    allowMassPingVCChannel: boolean,
}

export default class Config {
    guildId: string

    constructor(guildId: string) {
        this.guildId = guildId
    }
    
    async get(): Promise<config> {
        return new Promise(async (res, rej) => {
            const files = await fs.readdir(configsPath).catch((err) => { throw err; })
            let found = false

            for await (const file of files) {
                const nameId = file.split('.')[0]
                if (this.guildId == nameId) {
                    found = true
                    return res(require(`../configs/${file}`));
                } else {
                    continue;
                }
            }

            if (!found) return rej(false);
        })
    }
}
