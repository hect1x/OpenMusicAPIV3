const routes = (handler) => [
    {
      method: 'POST',
      path: '/export/playlists/{id}',
      handler: handler.postExportPlaylistHandler,
      options: {
        auth: 'songsapp_jwt',
      },
    },
];
   
module.exports = routes;