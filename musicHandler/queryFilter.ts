// BREAKING: Filter out age-restricted videos at all costs. //////////////////////////////////////////////////////

// Filter through different types of links (YouTube Video, YouTube Playlist, Privated/Age-Restricted Videos (crasher), Spotify Link (query dissassembly), etc.)

// Returns the YouTube Link (or array of links if it's a playlist)

import { TrackEntry } from './queue'

// YouTube
import * as ytdl from 'ytdl-core'
import * as ytSearch from 'yt-search'
import * as ytpl from 'ytpl'
import * as ytMusic from 'node-youtube-music'
import * as play from 'play-dl'

import { getVideoDurationInSeconds } from 'get-video-duration'

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
            
            return [
                {
                    title: query.match(discordCDN)[6],
                    author: "Unknown",
                    duration: Math.floor(await getVideoDurationInSeconds(query)),
                    sourceType: "DISCORD",
                    source: query,
                }
            ]

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

                        const resource = await ytMusic.searchMusics(`${track.name} ${artists}`)
                        if (resource[0].youtubeId) {
                            links.push({
                                title: track.name,
                                author: artists,
                                duration: resource[0].duration.totalSeconds,
                                sourceType: "YOUTUBE",
                                source: `https://youtube.com/watch?v=${resource[0].youtubeId}`,
                            })
                        }

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

                    const resource = await ytMusic.searchMusics(`${track.name} ${artists}`)
                    console.log(resource)
                    if (resource) {
                        return [
                            {
                            title: track.name,
                            author: artists,
                            duration: resource[0].duration.totalSeconds,
                            sourceType: "YOUTUBE",
                            source: `https://youtube.com/watch?v=${resource[0].youtubeId}`,
                            }
                        ]
                    }

                }

        } else if (playlistID) { // YouTube Playlist
            const playlist = await ytpl(playlistID).catch((err) => { throw err })
            const tracks = playlist.items

            let links: TrackEntry[] = []
            for (const track of tracks) {

                links.push({
                    title: track.title,
                    author: track.author.name,
                    duration: track.durationSec,
                    sourceType: "YOUTUBE",
                    source: track.url,
                })

            }

            return links;

        } else if (ytdl.validateURL(query)) { // YouTube Direct Link
            const track = await play.video_info(query)
            return [
                {
                    title: track.video_details.title,
                    author: track.video_details.channel.name,
                    duration: track.video_details.durationInSec,
                    sourceType: "YOUTUBE",
                    source: track.video_details.url,
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
                        duration: track.duration.seconds,
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
