import Joi from 'joi';

const bookSchema = Joi.object({
  id: Joi.number().optional(),
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  authorid: Joi.number().required(),
  author: Joi.string().allow('', null),
  averageRating: Joi.number().min(0).max(5).default(0).allow(null).optional(),
  ratingsCount: Joi.number().min(0).default(0).allow(null).optional(),
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
  pages: Joi.number().allow(null, '').optional(),
  publisher: Joi.string().allow('', null),
  slug: Joi.string().allow('', null),
  editions: Joi.array().items(
    Joi.object({
      isbn: Joi.string().allow('', null).optional(),
      format: Joi.string().allow('', null).optional(),
      publishedYear: Joi.string().allow('', null).optional(),
      language: Joi.string().allow('', null).optional(),
      pages: Joi.number().allow(null).optional(),
      publisher: Joi.string().allow('', null).optional(),
      asin: Joi.string().allow('', null).optional(),
      slug: Joi.string().allow('', null).optional()
    })
  ).optional()
});

export default bookSchema;