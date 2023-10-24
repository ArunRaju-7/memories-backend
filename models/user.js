import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    verified: {type: Boolean, default: false},
    id: {type: String}
});

const User = mongoose.model('User', userSchema);

// const validate = (user) => {
//     const schema = Joi.object({
//         name: Joi.string().required(),
//         email: Joi.string().email().required(),
//         password: Joi.string.required()
//     });
//     return schema.validate(PostMessage);
// }

export default User;