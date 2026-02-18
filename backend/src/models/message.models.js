
import mongoose from "mongoose";

// Define file schema separately for clarity
const fileSchema = new mongoose.Schema({
    url: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    type: { type: String, required: true },
}, { _id: false });

const messageSchema = new mongoose.Schema({
    senderId: {
        type: String,
        required: true,
    },
    receiverId: {
        type: String,
        required: true,
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    file: {
        type: fileSchema,
        required: false,
    },
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default: null,
    }
},{timestamps:true})

const Message = mongoose.model('Message', messageSchema);

export default Message;