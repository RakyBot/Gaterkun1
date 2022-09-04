export enum colorPalette {
    default = 6323595,
    trackOperation = 2201331,
    error = 15684431,
    success = 5025616,
}

export function basicEmbed(content: string, color?: colorPalette, title?: string) {
    return {
        title: title ? title : undefined,
        description: content,
        color: color ? color : undefined,
    };
}
