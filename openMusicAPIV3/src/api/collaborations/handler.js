class CollaborationHandler{
    constructor(collaborationsService, playlistsService, validator) {
        this._collaborationsService = collaborationsService;
        this._playlistsService = playlistsService;
        this._validator = validator;

        this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
        this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
    }

    async postCollaborationHandler(request,h ){
        const collab = this._validator.validateCollaborationPayload(request.payload);
        const { id: credentialId } = request.auth.credentials;
        const { playlistId, userId } = collab.value;
        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
        const collaborationId = await this._collaborationsService.addCollaboration({ playlistId, userId});

        const response = h.response({
            status: 'success',
            data: {
                collaborationId,
            },
        });
        response.code(201);
        return response;
    }

    async deleteCollaborationHandler(request) {
        const collaborationValidated = this._validator.validateCollaborationPayload(request.payload);
        const {id: credentialId} = request.auth.credentials;
        const { playlistId, userId } = collaborationValidated.value;
        await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
        await this._collaborationsService.deleteCollaboration({ playlistId, userId });
        return {
            status: 'success',
            message: 'Lagu berhasil dihapus',
        };
    }
}

module.exports = CollaborationHandler;