const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { Pool } = require('pg'); 
const { mapDBToSong } = require('../../utils');

class SongsService{
    constructor() {
        this._pool = new Pool();
    }

    async addSong({ title,year,genre,performer,duration,albumId }){
        const id = `song-${nanoid(16)}`;

        const query = {
            text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, year, performer, genre, duration, albumId],
        };

        const result = await this._pool.query(query);

        if (!result.rows[0].id) {
            throw new InvariantError('Lagu gagal ditambahkan');
          }
       
        return result.rows[0].id;
    }

    async getSongs({ title, performer }) {
        let query = {
            text: 'SELECT id, title, performer FROM songs',
            values: [],
        };
    
        const conditions = [];
        if (title) {
            conditions.push(`title ILIKE '%' || $${conditions.length + 1} || '%'`);
            query.values.push(title);
        }
        if (performer) {
            conditions.push(`performer ILIKE '%' || $${conditions.length + 1} || '%'`);
            query.values.push(performer);
        }
    
        if (conditions.length > 0) {
            query.text += ' WHERE ' + conditions.join(' AND ');
        }
    
        const result = await this._pool.query(query);
        return result.rows.map(mapDBToSong);
    }

    async getSongById(id){
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError('Lagu tidak ditemukan');
        }
       
        return result.rows.map(mapDBToSong)[0];
    }

    async editSongById ( id, { title,year,genre,performer,duration }){
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5 WHERE id = $6 RETURNING id',
            values: [title, year, performer, genre, duration, id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
        }
    }

    async deleteSongById(id){
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
        }
    }
}

module.exports = SongsService;