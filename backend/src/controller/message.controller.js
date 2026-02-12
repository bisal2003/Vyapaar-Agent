import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocket, io } from "../lib/socket.js";
import Message from "../models/message.models.js";
import User from "../models/user.models.js";


export const getusersforSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log('error in getusersforSidebar', error);
        res.status(500).json({ message: 'Internal server error' });

    }
}

export const getMessages = async (req, res) => {
    try {
        const { id: usertochatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: usertochatId },
                { senderId: usertochatId, receiverId: myId },
            ],
        }).populate('replyTo', 'text image file senderId')

        res.status(200).json(messages);
    } catch (error) {
        console.log('error in getMessages', error);
        res.status(500).json({ message: 'Internal server error' });

    }
}

export const sendMessage = async (req, res) => {
    try {
        const { text, image, file, replyTo } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image, {
                    resource_type: 'auto',
                    type: 'upload',
                    invalidate: true
                });
                imageUrl = uploadResponse.secure_url;
            } catch (cloudinaryError) {
                console.log('Cloudinary image upload error:', cloudinaryError);
                return res.status(500).json({ 
                    message: 'Failed to upload image. Please check your Cloudinary credentials in .env file.',
                    error: cloudinaryError.message 
                });
            }
        }

        let fileData;
        if (file && file.data) {
            try {
                // Upload file to cloudinary with public access
                const uploadResponse = await cloudinary.uploader.upload(file.data, {
                    resource_type: 'auto',
                    type: 'upload',
                    folder: 'chat-files',
                    invalidate: true
                });
                
                // Log successful upload
                console.log('File uploaded to Cloudinary:', uploadResponse.secure_url);
                
                fileData = {
                    url: uploadResponse.secure_url,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                };
            } catch (cloudinaryError) {
                console.log('Cloudinary file upload error:', cloudinaryError);
                return res.status(500).json({ 
                    message: 'Failed to upload file. Please check your Cloudinary credentials in .env file.',
                    error: cloudinaryError.message 
                });
            }
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
            file: fileData,
            replyTo: replyTo || null,
        });

        await newMessage.save();
        
        // Populate replyTo before sending via socket
        await newMessage.populate('replyTo', 'text image file senderId');
        
        //todo:realtime functionality goes here=>socket.io

        const receiverSocketId = getReceiverSocket(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage',newMessage);
        }

        res.status(200).json(newMessage);

    } catch (error) {
        console.log('error in sendMessage', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}