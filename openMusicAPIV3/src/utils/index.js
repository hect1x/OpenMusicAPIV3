const mapDBToSong = ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) => ({
    id,
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  });

const mapDBToPlaylistSong = (playlist, songs) => ({
    playlist: {
        id: playlist.id,
        name: playlist.name,
        username: playlist.username,
        songs: songs,
    },
});

const mapDBToPlaylist = (row) => ({
  id: row.id,
  name: row.name,
  username: row.username,
});

const mapDBToActivity = (playlistId, activities) => ({
  playlistId,
  activities: activities.map(activity => ({
      username: activity.username,
      title: activity.title,
      action: activity.action,
      time: activity.time,
  })),
});

const mapDBToAlbumLike = (count) => ({
  likes: parseInt(count),
});

module.exports = { mapDBToSong, mapDBToPlaylistSong, mapDBToPlaylist, mapDBToActivity, mapDBToAlbumLike };