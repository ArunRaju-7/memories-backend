import mongoose, { SchemaTypes } from "mongoose";

const TokenSchema = mongoose.Schema({
    userId : {
        type: SchemaTypes.ObjectId,
        required: true,
        ref: "User",
        unique: true
    },
    token: {
        type: String,
        required: true
    },
    createdAt : {
        type: Date,
        default: Date.now(),
        expires: 3600
    }

});

const Token = mongoose.model('Token', TokenSchema);

export default Token;