// BREAKING: Filter out age-restricted videos at all costs. //////////////////////////////////////////////////////

// Filter through different types of links (YouTube Video, YouTube Playlist, Privated/Age-Restricted Videos (crasher), Spotify Link (query dissassembly), etc.)

// Returns the YouTube Link (or array of links if it's a playlist)

import { TrackEntry } from './queue'

// YouTube
import * as ytdl from 'ytdl-core'
import * as ytSearch from 'yt-search'
import * as ytpl from 'ytpl'

// Spotify
import * as unfetch from "isomorphic-unfetch"
const { getTracks } = require('spotify-url-info')(unfetch) // https://github.com/microlinkhq/spotify-url-info

const discordCDN = /(https?:\/\/)?(www.)?(cdn.discordapp.com\/attachments)\/(.+[0-9])\/(.+[0-9])\/(.+[a-z][0-9])/
const spotifyLink = /(https?:\/\/)?(www.)?(open.spotify.com\/(track|playlist))\/.+/

export default {
    async getEntry(query: string): Promise<TrackEntry[] | false> {

        const playlistID = await ytpl.getPlaylistID(query).catch((err) => {})

        // Insert Regexs here to decide if it's a link or search request
        if (query.match(discordCDN)) { // Discord
            return false; /////////////////////////////// To-Do ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        } else if (query.match(spotifyLink)) { // Spotify
            const tracks = await getTracks(query)
                if (tracks.length > 1) { // It's a playlist

                    let links: TrackEntry[] = []
                    for (const track of tracks) {
                        let artists = `${track.artists[0].name}`

                        for (const [index, artist] of track.artists.entries()) {
                            if (index == 0) continue;
                            artists = `${artists}, ${artist.name}`
                        }

                        const resource = await ytSearch(`${track.name} ${track.artists[0]} audio`)
                        if (resource.videos[0].videoId)

                        links.push({
                            title: track.title,
                            author: track.author.name,
                            sourceType: "YOUTUBE",
                            source: resource.videos[0].url,
                        })
                        continue;
                    }
                    return links;
                
                } else if (tracks.length == 1) { // Single Spotify Track

                    const track = tracks[0]
                    let artists = `${track.artists[0].name}`

                    for (const [index, artist] of track.artists.entries()) {
                        if (index == 0) continue;
                        artists = `${artists}, ${artist.name}`
                    }

                    const resource = await ytSearch(`${track.name} ${track.artists[0]} audio`)

                    return [
                        {
                            title: track.title,
                            author: track.author.name,
                            sourceType: "YOUTUBE",
                            source: resource.videos[0].url,
                        }
                    ]

                }

        } else if (playlistID) { // YouTube Playlist
            const playlist = await ytpl(playlistID).catch((err) => { throw err })
            const tracks = playlist.items

            let links: TrackEntry[] = []
            for (const track of tracks) {

                links.push({
                    title: track.title,
                    author: track.author.name,
                    sourceType: "YOUTUBE",
                    source: track.url,
                })

            }

            return links;

        } else if (ytdl.validateURL(query)) { // YouTube Direct Link
            const track = await ytdl.getBasicInfo(query).catch((err) => { throw err })
            return [
                {
                    title: track.videoDetails.title,
                    author: track.videoDetails.author.name,
                    sourceType: "YOUTUBE",
                    source: track.videoDetails.video_url,
                }
            ]

        } else { // Search Query
            const trackFinder = async (query) => {  
                const trackResult = await ytSearch(query).catch((err) => { throw err })
                return (trackResult.videos.length > 1) ? trackResult.videos[0] : null;
            }

            const track = await trackFinder(query)
            if (track) {

                return [
                    {
                        title: track.title,
                        author: track.author.name,
                        sourceType: "YOUTUBE",
                        source: track.url
                    }
                ];
            
            } else {

                return false;
            
            }

        }

    }
}
