const Joi = require('joi');
const currentYear = new Date().getFullYear();

const AlbumPayloadSchema = Joi.object({
    name: Joi.string().required(),
    year: Joi.number().min(1000).max(currentYear).required(),
});

const AlbumCoverPayloadSchema = Joi.object({
    'content-type': Joi.string().valid('image/apng', 'image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp').required(),
}).unknown();

module.exports = { AlbumPayloadSchema, AlbumCoverPayloadSchema };