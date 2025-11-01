const Joi = require('joi');

const publisherSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string().required(),
  description: Joi.string(),
  website: Joi.string().uri(),
  slug: Joi.string(),
});

module.exports = publisherSchema;
