class Listener {
    constructor(playlistsService, mailSender){
        this._playlistsService = playlistsService;
        this._mailSender = mailSender;

        this.listen = this.listen.bind(this);
    }

    async listen(message){
        try {
            const { playlistId, targetEmail } = JSON.parse(message.content.toString());

            const rawData = await this._playlistsService.getPlaylist(playlistId);
            const playlist = {
                id: rawData.rows[0].playlist_id,
                name: rawData.rows[0].playlist_name,
                songs: rawData.rows.map(row => ({
                id: row.song_id,
                title: row.title,
                performer: row.performer
                })),
            };
            const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify({ playlist }));
        console.log(result);
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = Listener;