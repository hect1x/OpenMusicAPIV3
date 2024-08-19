const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToPlaylistSong, mapDBToPlaylist, mapDBToActivity } = require('../../utils');
class PlaylistsService {
    constructor (collaborationsService) {
        this._pool = new Pool();

        this._collaborationsService = collaborationsService;
    }

    async addPlaylist({name, credentialId}){
        const id = `playlist-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
            values: [id, name, credentialId],
        }

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
        }
       
        return result.rows[0].id;
    }

    async getPlaylists(id) {
        const query = {
            text: `
                SELECT 
                    playlists.id, 
                    playlists.name, 
                    users.username
                FROM 
                    playlists
                LEFT JOIN 
                    collaborations ON collaborations.playlist_id = playlists.id   
                INNER JOIN 
                    users ON users.id = playlists.owner_id
                WHERE 
                    playlists.owner_id = $1 OR collaborations.user_id = $1;
            `,
            values: [id]
        };

        const result = await this._pool.query(query);

        return result.rows.map(mapDBToPlaylist);
    }

    async verifyPlaylistOwner(id, credentialId){
        const query = {
            text: 'SELECT id, owner_id FROM playlists WHERE id = $1',
            values: [id],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length || !result.rows[0].id) {
            throw new NotFoundError('Id tidak ditemukan');
        } 
        const playlistId = result.rows[0].owner_id;
        if (playlistId !== credentialId) {
            throw new AuthorizationError('Anda tidak berhak mengakses resource inisfksdsf');
        }
    }

    async deletePlaylistById(id){
        const query = {
            text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
        }
    }


    async verifyPlaylistAccess(playlistId, userId){
        try {
            await this.verifyPlaylistOwner(playlistId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            try {
                await this._collaborationsService.verifyCollaboration(playlistId, userId);
            } catch {
                throw error;
            }
        }
    }

    async addActivity(playlistId, userId, songId) {
        const id = `activity-${nanoid(16)}`;
        const time = new Date();
        const query = {
            text: 'INSERT INTO playlistsongs_activities VALUES($1, $2, $3, $4, $5, $6)',
            values: [id, playlistId, songId, userId, 'add', time],
        };

        await this._pool.query(query);
    }

    async deleteActivity(songId, playlistId, userId) {
        const id = `activity-${nanoid(16)}`;
        const time = new Date();
        const query = {
            text: 'INSERT INTO playlistsongs_activities VALUES($1, $2, $3, $4, $5, $6)',
            values: [id, playlistId, songId, userId, 'delete', time],
        };

        await this._pool.query(query);
    }

    async verifySongExistence(songId){
        const query = {
            text: 'SELECT id FROM songs WHERE id = $1',
            values: [songId],
        };

        const result = await this._pool.query(query);

        if(!result.rows.length){
            throw new NotFoundError('Song id tidak ada');
        }
    }
    async addSongToPlaylist(playlistId, songId, userId){
        await this.verifySongExistence(songId);
        const id = `playlistsongs-${nanoid(16)}`;
        const query = {
            text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
            values: [id, playlistId, songId],
        };

        const result = await this._pool.query(query);

        if(!result.rows.length){
            throw new InvariantError('Lagu gagal ditambahkan ke playlist');
        }

        await this.addActivity(playlistId, userId, songId);
        return result.rows[0].id;
    }

    async getSongFromPlaylist(id){
        const queryPlaylist = {
            text: `
                SELECT 
                    playlists.id, 
                    playlists.name, 
                    users.username
                FROM 
                    playlists
                LEFT JOIN
                    users on playlists.owner_id = users.id
                WHERE 
                    playlists.id = $1`,
            values: [id],
        };

        const querySong = {
            text: `
                SELECT 
                    songs.id, 
                    songs.title, 
                    songs.performer
                FROM 
                    playlistsongs
                JOIN
                    songs on playlistsongs.song_id = songs.id
                WHERE 
                    playlist_id = $1`,
            values: [id],
        }
        const resultPlaylist = await this._pool.query(queryPlaylist);
        const resultSongs = await this._pool.query(querySong);

        return mapDBToPlaylistSong(resultPlaylist.rows[0], resultSongs.rows);
    }

    async deleteSongInPlaylist(songId, playlistId, userId){
        const query = {
            text: 'DELETE FROM playlistsongs WHERE song_id = $1 RETURNING song_id',
            values: [songId],
        };

        const result = await this._pool.query(query);

        if(!result.rows.length){
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }

        await this.deleteActivity(songId, playlistId, userId);
    }

    async getActivity(playlistId){
        const query = {
            text: `
                SELECT 
                    users.username, 
                    songs.title,
                    playlistsongs_activities.action, 
                    playlistsongs_activities.time
                FROM 
                    playlistsongs_activities
                INNER JOIN
                    users ON users.id = playlistsongs_activities.user_id
                INNER JOIN
                    songs on songs.id = playlistsongs_activities.song_id
                WHERE 
                    playlistsongs_activities.playlist_id = $1`,
            values: [playlistId],
        };
        const result = await this._pool.query(query);
        return mapDBToActivity(playlistId,result.rows);
    }
    
}

module.exports = PlaylistsService;