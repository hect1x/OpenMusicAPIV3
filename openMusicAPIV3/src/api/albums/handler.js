class AlbumsHandler{
    constructor(albumsService, storageService, validator){
        this._service = albumsService;
        this._storageService = storageService;
        this._validator = validator;

        this.postAlbumHandler = this.postAlbumHandler.bind(this);
        this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
        this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
        this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);
        this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
        this.postAlbumLikeHandler = this.postAlbumLikeHandler.bind(this);
        this.deleteAlbumLikeHandler = this.deleteAlbumLikeHandler.bind(this);
        this.getAlbumLikeHandler = this.getAlbumLikeHandler.bind(this);
    }

    async postAlbumHandler(request, h){
        this._validator.validateAlbumPayload(request.payload);
        const { name, year } = request.payload;

        const albumId = await this._service.addAlbum({name, year});

        const response = h.response({
            status: 'success',
            message: 'Album berhasil ditambahkan',
            data: {
               albumId,
            },
        });
        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request){
        const { id } = request.params;
        const album = await this._service.getAlbumById(id);
        const coverUrl = album.coverUrl 
            ? `http://localhost:${process.env.PORT || 5000}/albums/${album.id}/cover/${album.coverUrl}` 
            : null;

        album.coverUrl = coverUrl;
        return {
            status: 'success',
            data: {
                album,
            },
        };
    }

    async putAlbumByIdHandler(request){
        this._validator.validateAlbumPayload(request.payload);
        const { id } = request.params;

        await this._service.editAlbumById(id, request.payload);

        return{
            status: 'success',
            message: 'Album berhasil diperbarui',
        };
    }

    async deleteAlbumByIdHandler(request){
        const { id } = request.params;
        await this._service.deleteAlbumById(id);

        return {
            status: 'success',
            message: 'Album berhasil dihapus',
        };
    }

    async postAlbumCoverHandler(request, h) {
        const { cover } = request.payload;
        const  { id } = request.params;

        await this._validator.validateAlbumCoverPayload(cover.hapi.headers);

        const fileLocation = await this._storageService.writeFile(cover, cover.hapi);

        await this._service.addAlbumCover(id, fileLocation);

        const response = h.response({
            status: 'success',
            message: 'Sampul berhasil diunggah',
        });
        response.code(201);
        return response;
    }

    async postAlbumLikeHandler(request, h){
        const { id: credentialId }= request.auth.credentials;
        const { id } = request.params;

        await this._service.getAlbumById(id);
        const isLiked = await this._service.isAlbumLikedByUser(credentialId, id);
        if (isLiked) {
            const response = h.response({
              status: 'fail',
              message: 'Album telah di-like sebelumnya',
            });
            response.code(400); 
            return response;
        }
        await this._service.addAlbumLike(credentialId, id);

        const response = h.response({
            status: 'success',
            message: 'Berhasil ditambahkan like',
        });
        response.code(201);
        return response;

    }

    async deleteAlbumLikeHandler(request){
        const { id: credentialId }= request.auth.credentials;
        const { id } = request.params;

        await this._service.getAlbumById(id);
        await this._service.deleteAlbumLike(credentialId, id);
        
        return {
            status: 'success',
            message: 'Album like berhasil dihapus',
        };
    }

    async getAlbumLikeHandler(request, h) {
        const { id } = request.params;

        const result = await this._service.getAlbumLike(id);

        if (result.isCache == true) {
            const response = h.response({
                status: 'success',
                data: result.result,
            });
            response.header('X-Data-Source', 'cache');
            return response;
        }

        return {
            status: 'success',
            data: result.result
        };
    }
}

module.exports = AlbumsHandler;