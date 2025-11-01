const Joi = require('joi');

const bookSchema = Joi.object({
  id: Joi.number().optional(),
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  authorid: Joi.number().required(),
  author: Joi.string().allow('', null),
  ratings: Joi.alternatives().try(
    Joi.number(),
    Joi.string().allow('', null)
  ).optional(),
  genre: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().allow('', null)
  ),
  image: Joi.string().allow('', null),
  year: Joi.string().allow('', null),
  literaryAwards: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().allow('', null)
  ),
  originalTitle: Joi.string().allow('', null),
  series: Joi.string().allow('', null),
  setting: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().allow('', null)
  ),
  characters: Joi.alternatives().try(
    Joi.array().items(Joi.string()),
    Joi.string().allow('', null)
  ),
  edition: Joi.object({
    id: Joi.number().required(),
    bookId: Joi.number().required(),
    format: Joi.string().allow('', null),
    year: Joi.string().allow('', null),
    publisher: Joi.string().allow('', null),
    ISBN: Joi.string().allow('', null),
    asin: Joi.string().allow('', null),
    language: Joi.string().allow('', null),
    pages: Joi.number().allow(null, '').optional(),
  }).optional(),
  editionid: Joi.alternatives().try(
    Joi.number(),
    Joi.string().allow('', null)
  ).optional(),
  publisherid: Joi.alternatives().try(
    Joi.number(),
    Joi.string().allow('', null)
  ).optional(),
  publisher: Joi.string().allow('', null),
  slug: Joi.string().allow('', null),
});

module.exports = bookSchema;