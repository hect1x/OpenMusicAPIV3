const { Pool } = require('pg');

class PlaylistsService {
    constructor() {
        this._pool = new Pool();
    }

    async getPlaylist(playlistId) {
        const query = {
            text: `SELECT 
                        playlists.id AS playlist_id, 
                        playlists.name AS playlist_name, 
                        songs.id AS song_id, 
                        songs.title, 
                        songs.performer
                    FROM 
                        playlists
                    LEFT JOIN 
                        playlistsongs ON playlists.id = playlistsongs.playlist_id
                    LEFT JOIN 
                        songs ON playlistsongs.song_id = songs.id
                    WHERE 
                        playlists.id = $1`,
            values: [playlistId],
        };
    
        const result = await this._pool.query(query);
        if (result.rows.length === 0) {
            throw new Error('Playlist not found');
        }

        // console.log(result.rows);
        return result;
    }
}

module.exports = PlaylistsService;