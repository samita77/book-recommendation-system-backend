const Joi = require('joi');

const authorSchema = Joi.object({
  id: Joi.number(),
  name: Joi.string().required(),
  born: Joi.string().allow('', null),
  placeOfBirth: Joi.string().allow('', null),
  genre: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().allow('')
  ),
  books: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().allow('')
  ),
  description: Joi.string().allow('', null),
  image: Joi.string().allow('', null),
  slug: Joi.string().allow('', null),
});

module.exports = authorSchema;