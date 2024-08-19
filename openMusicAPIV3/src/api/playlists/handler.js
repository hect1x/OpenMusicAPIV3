class PlaylistsHandler{
    constructor(service, validator){
        this._service = service;
        this._validator = validator;

        this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
        this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
        this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
        this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
        this.getSongFromPlaylistHandler = this.getSongFromPlaylistHandler.bind(this);
        this.deleteSongInPlaylistHandler = this.deleteSongInPlaylistHandler.bind(this);
        this.getPlaylistActivityHandler = this.getPlaylistActivityHandler.bind(this);
    }

    async postPlaylistHandler(request, h){
        this._validator.validatePlaylistPayload(request.payload);
        const { name } = request.payload;
        const { id: credentialId } = request.auth.credentials;
        const playlistId = await this._service.addPlaylist({ name, credentialId });

        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                playlistId,
            },
        });
        response.code(201);
        return response;
    }

    async getPlaylistsHandler(request) {
        const { id: userId } = request.auth.credentials;
        const playlists = await this._service.getPlaylists(userId);
    
        return {
            status: 'success',
            data: {
                playlists,
            },
        };
    }

    async deletePlaylistByIdHandler(request){
        const { id } = request.params;
        const {id: credentialId} = request.auth.credentials;
        await this._service.verifyPlaylistOwner(id, credentialId);
        await this._service.deletePlaylistById(id);
        return {
            status: 'success',
            message: 'Playlist successfully deleted',
        };
    }

    async postSongToPlaylistHandler(request, h){
        const { value: { songId } } = this._validator.validatePlaylistSongPayload(request.payload);
        const {id: credentialId} = request.auth.credentials;
        const playlistId = request.params;
        await this._service.verifyPlaylistAccess(playlistId.id, credentialId);
        const addedSong = await this._service.addSongToPlaylist(playlistId.id,songId, credentialId);

        const response = h.response({
            status: 'success',
            message: 'Playlist berhasil ditambahkan',
            data: {
                addedSong,
            },
        });
        response.code(201);
        return response;
    }

    async getSongFromPlaylistHandler(request){
        const { id: credentialId } = request.auth.credentials;
        const playlistId = request.params;

        await this._service.verifyPlaylistAccess(playlistId.id, credentialId);
        const result = await this._service.getSongFromPlaylist(playlistId.id);

        return {
            status: 'success',
            data: result,
        };
    }

    async deleteSongInPlaylistHandler(request){
        const validatedPayload = this._validator.validatePlaylistSongPayload(request.payload);
        const { value: { songId } } = validatedPayload;
        const { id: credentialId } = request.auth.credentials;
        const playlistId = request.params;
        await this._service.verifyPlaylistAccess(playlistId.id, credentialId);
        await this._service.deleteSongInPlaylist(songId, playlistId.id, credentialId);

        return {
            status: 'success',
            message: 'Lagu berhasil dihapus',
        };
    }

    async getPlaylistActivityHandler(request){
        const { id: credentialId } = request.auth.credentials;
        const playlistId = request.params;

        await this._service.verifyPlaylistAccess(playlistId.id, credentialId);
        const activities = await this._service.getActivity(playlistId.id);

        return {
            status: 'success',
            data: activities,
        };
    }
}

module.exports = PlaylistsHandler;