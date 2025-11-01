const Joi = require('joi');

const editionSchema = Joi.object({
  id: Joi.number().optional(),
  bookId: Joi.number().required(),
  format: Joi.string().allow('', null),
  year: Joi.string().allow('', null),
  publisher: Joi.string().allow('', null),
  ISBN: Joi.string().allow('', null),
  asin: Joi.string().allow('', null),
  language: Joi.string().allow('', null),
  pages: Joi.alternatives().try(
    Joi.number(),
    Joi.string().allow('', null)
  ).optional(),
  slug: Joi.string().allow('', null),
});

module.exports = editionSchema;