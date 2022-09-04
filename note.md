~~2.) Everytime a new song is queued using `add()`, the current player will lag for a second. I'm thinking this is due to the the entire queueMap being updated with the `player` instance inside of it. Maybe moving the player instance into a separate map will help this?~~
Tried, did not work.


To-Do List:
~~- Support age-restricted YouTube Links~~
~~- Support Spotify Links~~
- Support Soundcloud Links
~~- Finish /queue printing~~
    ~~- Instead of /now playing, add the time remaining into /queue~~
    ~~- Add buttons for queue pages~~
~~- Seek feature~~
    ~~- https://play-dl.github.io/modules.html#stream~~
