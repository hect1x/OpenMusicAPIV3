

exports.up = (pgm) => {
    pgm.createTable('playlists', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        name: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        owner_id: {
            type: 'VARCHAR(50)',
            references: 'users',
            onDelete: 'cascade',
            onUpdate: 'cascade',
        },
    });
};

exports.down = (pgm) => {
    pgm.dropTable('playlists');
};