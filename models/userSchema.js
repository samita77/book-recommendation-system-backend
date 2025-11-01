const Joi = require('joi');

const userSchema = Joi.object({
  id: Joi.number().required().min(0),
  username: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports = userSchema;
