import Joi from 'joi';

const userSchema = Joi.object({
  id: Joi.number().required().min(0),
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export default userSchema;
