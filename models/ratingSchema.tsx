import Joi from 'joi';

const ratingSchema = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  bookId: Joi.string().required(),
  userId: Joi.string().required(),
});

export default ratingSchema;
