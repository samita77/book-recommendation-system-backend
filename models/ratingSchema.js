const Joi = require('joi');

const ratingSchema = Joi.object({
  bookId: Joi.number().required(),
  score: Joi.number().min(1).max(5).required(), // Assuming a 1-5 star rating
});

module.exports = ratingSchema;
