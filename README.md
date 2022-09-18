# RocketFuel Voice
## A powerful music bot and voice channel handler for Discord

# Features
- Supports playing YouTube and Spotify Links and Playlists
- Configurable for multiple guilds
- Discord Slash Command Support
- Wide array of commands


# Setup
> ### Make sure to run `npm i` to install all dependencies!

---
## Creating YouTube Token
To enable to bot to play age-restricted YouTube videos, a token is needed.
<br />
[`play-dl`](https://www.npmjs.com/package/play-dl) is the package used to fetch and play YouTube videos. Setup instructions for a token using this package can be found [here](https://github.com/play-dl/play-dl/tree/ce9c57460701535ca077f479fb9c9c2d88fa0c7f/instructions#youtube-cookies).

## Setting up Guild Configuration Files
See `example.json` for a template of a guild configuration file. <br />
```
All guild configuration files must be named using the format guildid.json
Example: 805284705900560424.json
```
The structure of a guild configuration file looks as the following:
```javascript
{
    "vcCategory": "776906203745878016", // This is a category id for where temporary Voice Channels should be held.
    "createVC": "777210472184545322", // This is a channel id for the channel where users should join to create their own temporary Voice Channel.
    "privateVC": true // This is a boolean enabling the private VC feature. If this is set to false, the above is ignored.
    "allowMassPingVCChannel": false, // This is a boolean that will either enable or disable a check for an exploit that allows users to mass ping within a voice channel's chat.
}
```
---
## Setting up a `.env` configuration
For security purposes, the bot uses a `.env` file to store global configurations and its token. <br />
The file **must** be in the root directory of the bot files (where main.ts is) and named `.env` <br />
The structure of a `.env` file is as follows:
```java
TOKEN=YOUR_BOT_TOKEN_HERE // NEVER share this token with anyone, as it gives anyone full access to your bot account.
TESTGUILD=776904894991826964 // This is the guild where slash commands will be instantly pushed on bot startup if commands are going to be tested. This variable can be left blank.
TIMEOUT_MS=100000 // This is a timestamp in milliseconds of how long the bot should wait before disconnecting from VC due to inactivity
```

# Deploying
TypeScript must be installed on your development machine in order to transpile the code to JavaScript. <br />
Run `tsc` in the root directory of the project and run the output files by going to the output folder and running `node main.js`. The bot should be in operation after this.