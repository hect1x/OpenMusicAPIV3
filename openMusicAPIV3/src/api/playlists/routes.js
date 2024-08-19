const routes = (handler) => [
    {
      method: 'POST',
      path: '/playlists',
      handler: handler.postPlaylistHandler,
      options: {
          auth: 'songsapp_jwt',
      },
    },
    {
      method: 'GET',
      path: '/playlists',
      handler: handler.getPlaylistsHandler,
      options: {
          auth: 'songsapp_jwt',
      },
    },
    {
      method: 'DELETE',
      path: '/playlists/{id}',
      handler: handler.deletePlaylistByIdHandler,
      options: {
          auth: 'songsapp_jwt',
      },
    },
    {
      method: 'POST',
      path: '/playlists/{id}/songs',
      handler: handler.postSongToPlaylistHandler,
      options: {
          auth: 'songsapp_jwt',
      },
    },
    {
      method: 'GET',
      path: '/playlists/{id}/songs',
      handler: handler.getSongFromPlaylistHandler,
      options: {
          auth: 'songsapp_jwt',
      },
    },
    {
      method: 'DELETE',
      path: '/playlists/{id}/songs',
      handler: handler.deleteSongInPlaylistHandler,
      options: {
          auth: 'songsapp_jwt',
      },
    },
    {
      method: 'GET',
      path: '/playlists/{id}/activities',
      handler: handler.getPlaylistActivityHandler,
      options: {
        auth: 'songsapp_jwt',
    },
  },
  ];
   
module.exports = routes;