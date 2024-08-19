const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { Pool } = require('pg'); 
const { mapDBToAlbumLike } = require('../../utils/index');

class AlbumsService{
    constructor(cacheService) {
        this._pool = new Pool();

        this._cacheService = cacheService;
    }

    async addAlbum ({ name, year}){
        const id = `album-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3, $4) RETURNING id',
            values: [id, name, year, null],
        }

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Album gagal ditambahkan');
        }
       
        return result.rows[0].id;
    }

    async getAlbumById(id){
        const query = {
            text: 'SELECT id, name, year, cover FROM albums WHERE id = $1',
            values: [id],
        };
    
        const queryAlbumSong = {
            text: 'SELECT songs.id, songs.title, songs.performer FROM songs WHERE songs.album_id = $1',
            values: [id]
        };
    
        const result = await this._pool.query(query);
        const albumSong = await this._pool.query(queryAlbumSong);
    
        if (!result.rows.length) {
            throw new NotFoundError('Album tidak ditemukan');
        }
       
        const album = result.rows[0];
        return {
            id: album.id,
            name: album.name,
            coverUrl: (album.cover === null) ? null : album.cover, 
            year: album.year,
            songs: albumSong.rows.map(song => ({
                id: song.id,
                title: song.title,
                performer: song.performer
            }))
        };
    }
    

    async editAlbumById ( id, {name, year}){
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id]
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
        }
    }

    async deleteAlbumById (id){
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
        }
    }

    async addAlbumCover(id, fileLocation){
        const query = {
            text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
            values: [fileLocation, id],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows.length) {
            throw new NotFoundError('Album not found');
        }
    }

    async isAlbumLikedByUser(userId, albumId) {
        const query = {
          text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
          values: [userId, albumId],
        };
        const result = await this._pool.query(query);
    
        return result.rowCount > 0;
    }

    async addAlbumLike(userId, albumId){
        const id = `albumLike-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
            values: [id, userId, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length){
            throw new InvariantError('Gagal. Id albumLike tidak dapat ditambahkan');
        }

        await this._cacheService.delete(`album:${albumId}`);
    }

    async deleteAlbumLike(userId, albumId){

        const query = {
            text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
            values: [userId, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length){
            throw new NotFoundError('Album Like gagal dihapus. Id tidak ditemukan');
        }

        await this._cacheService.delete(`album:${albumId}`);
    }

    async getAlbumLike(albumId) {

        try {
            const result = await this._cacheService.get(`album:${albumId}`);
            return {result: JSON.parse(result), isCache: true};
        } catch (error) {
            console.log(error) // for esslint to sksip error
            const query = {
                text: 'SELECT COUNT(album_id) FROM user_album_likes WHERE album_id = $1',
                values: [albumId],
            };
    
            const result = await this._pool.query(query);

            const counter = mapDBToAlbumLike(result.rows[0].count);
            await this._cacheService.set(`album:${albumId}`, JSON.stringify(counter));
    
            return {result: counter};
        }
    }

}

module.exports = AlbumsService;