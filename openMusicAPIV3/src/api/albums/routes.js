
const routes = (handler) => [
    {
      method: 'POST',
      path: '/albums',
      handler: handler.postAlbumHandler,
    },
    {
      method: 'GET',
      path: '/albums/{id}',
      handler: handler.getAlbumByIdHandler,
    },
    {
      method: 'PUT',
      path: '/albums/{id}',
      handler: handler.putAlbumByIdHandler,
    },
    {
      method: 'DELETE',
      path: '/albums/{id}',
      handler: handler.deleteAlbumByIdHandler,
    },
    {
      method: 'POST',
      path: '/albums/{id}/covers',
      handler: handler.postAlbumCoverHandler,
      options: {
          payload: {
              allow: 'multipart/form-data',
              multipart: true,
              output: 'stream',
              maxBytes: 512000,
          },
      },
    },
    {
      method: 'GET',
      path: '/albums/{id}/cover/{filename}',
      handler: {
        directory: {
            path: './src/api/albums/file/images',
            redirectToSlash: true,
            index: false
        },
      },
    },
    {
      method: 'POST',
      path: '/albums/{id}/likes',
      handler: handler.postAlbumLikeHandler,
      options: {
        auth: 'songsapp_jwt',
      },
    },
    {
      method: 'DELETE',
      path: '/albums/{id}/likes',
      handler: handler.deleteAlbumLikeHandler,
      options: {
        auth: 'songsapp_jwt',
      },
    },
    {
      method: 'GET',
      path: '/albums/{id}/likes',
      handler: handler.getAlbumLikeHandler,
    },
];
  
  module.exports = routes;