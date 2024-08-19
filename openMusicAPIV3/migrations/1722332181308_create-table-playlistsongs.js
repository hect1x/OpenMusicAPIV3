

exports.up = (pgm) => {
    pgm.createTable('playlistsongs', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        playlist_id: {
            type: 'VARCHAR(50)',
            references: 'playlists',
            onDelete: 'cascade',
            onUpdate: 'cascade',
        },
        song_id: {
            type: 'VARCHAR(50)',
            references: 'songs',
            onDelete: 'cascade',
            onUpdate: 'cascade',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('playlistsongs');
};