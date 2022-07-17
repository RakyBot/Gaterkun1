import { ColorResolvable, HexColorString } from "discord.js";

export const colorPalette = {
    default: "#607d8b" as HexColorString,
    trackOperation: "#2196f3" as HexColorString,
    error: "#ef534f" as HexColorString,
    success: "#4caf50" as HexColorString
}

export function basicEmbed(content: string, color?: ColorResolvable, title?: string) {
    return {
        title: title ? title : undefined,
        description: content,
        color: color ? color : undefined,
    };
}
