class ExportsHandler {
    constructor(service, playlistsService, validator) {
        this._service = service;
        this._playlistsService = playlistsService;
        this._validator = validator;

        this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
    }

    async postExportPlaylistHandler(request, h) {
        this._validator.validateExportPlaylistPayload(request.payload);

        const { id: credentialId } = request.auth.credentials;
        const playlistId = request.params;
        await this._playlistsService.verifyPlaylistOwner(playlistId.id, credentialId);

        const message = {
            playlistId: playlistId.id,
            targetEmail: request.payload.targetEmail,
        };

        await this._service.sendMessage('export:playlists', JSON.stringify(message));

        const response = h.response({
            status: 'success',
            message: 'Permintaan Anda sedang kami proses',
        });
        response.code(201);
        return response;
    }
}
module.exports = ExportsHandler;