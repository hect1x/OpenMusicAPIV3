

exports.up = (pgm) => {
    pgm.createTable('playlistsongs_activities', {
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
            notNull: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        action: {
            type: 'text',
            notNull: true,
        },
        time: {
            type: 'text',
            notNull: true,
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('playlistsongs_activities');
};
