import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocket, io } from "../lib/socket.js";
import Message from "../models/message.models.js";
import User from "../models/user.models.js";
import Customer from "../models/customer.models.js";
import agentService from "../services/agent.service.js";


export const getusersforSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        
        // Get all customers
        const customers = await Customer.find().select('name phone email');
        
        // Transform customers to user format
        const customerUsers = customers.map(customer => ({
            _id: customer._id,
            fullName: customer.name,
            email: customer.email || customer.phone,
            profilePic: `https://avatar.iran.liara.run/public?username=${customer.name}`,
            isCustomer: true
        }));
        
        // Get online users from socket (excluding self)
        const { getUserSocketMap } = await import('../lib/socket.js');
        const userSocketMap = getUserSocketMap();
        const onlineUserIds = Object.keys(userSocketMap).filter(id => id !== loggedInUserId);
        
        // Create demo users for online connections
        const onlineUsers = onlineUserIds.map(userId => {
            // Extract name from user ID (format: user-name-parts)
            const nameParts = userId.replace('user-', '').split('-');
            const name = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
            
            return {
                _id: userId,
                fullName: name,
                email: `${userId}@demo.com`,
                profilePic: `https://avatar.iran.liara.run/public/boy?username=${name}`,
                isCustomer: false,
                isOnline: true
            };
        });
        
        // Combine and return
        const allUsers = [...onlineUsers, ...customerUsers];
        res.status(200).json(allUsers);
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
        
        // Get receiver socket ID early for use in @v processing
        const receiverSocketId = getReceiverSocket(receiverId);
        
        // Initialize agent response
        let agentResponse = null;

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
        
        // Check if message contains @v tag for agent processing
        const isAgentTagged = text && text.includes('@v');
        
        if (isAgentTagged) {
            try {
                let customer = null;
                
                // Check if receiverId is a valid MongoDB ObjectId (customer from database)
                // ObjectIds are 24 character hex strings
                const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(receiverId);
                
                if (isValidObjectId) {
                    // Try to find existing customer by ID
                    customer = await Customer.findById(receiverId);
                }
                
                // If not found or receiver is a demo user, find or create a customer
                if (!customer) {
                    // Extract name from receiverId (format: user-name-parts)
                    const nameParts = receiverId.toString().replace('user-', '').split('-');
                    const customerName = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
                    const demoEmail = `${receiverId}@demo.com`;
                    
                    // Try to find by email first
                    customer = await Customer.findOne({ email: demoEmail });
                    
                    // Create only if doesn't exist
                    if (!customer) {
                        customer = await Customer.create({
                            name: customerName,
                            phone: demoEmail,
                            email: demoEmail,
                        });
                    }
                }
                
                // Extract context (text after @v or the replied message)
                let contextMessage = text.replace('@v', '').trim();
                
                // If replying to a message, use that as context
                if (replyTo) {
                    const repliedMsg = await Message.findById(replyTo);
                    if (repliedMsg && repliedMsg.text) {
                        contextMessage = repliedMsg.text + ' ' + contextMessage;
                    }
                }
                
                // Process with AI agent
                console.log('Processing @v command:', contextMessage);
                const result = await agentService.processVyapaarCommand(
                    contextMessage,
                    '',
                    customer
                );
                
                console.log('🔍 Agent result:', JSON.stringify(result, null, 2));
                
                if (result.success) {
                    console.log('✅ Agent success - creating invoice message');
                    // Create agent response message
                    const billMessage = `✅ Invoice Generated!\n\n` +
                        `Invoice #: ${result.transaction.invoiceNumber}\n` +
                        `Customer: ${result.transaction.customerName}\n` +
                        `Total: ₹${result.transaction.totalAmount.toFixed(2)}\n` +
                        `Status: ${result.transaction.paymentStatus}\n\n` +
                        `Items:\n` +
                        result.transaction.items.map(item => 
                            `• ${item.productName} - ${item.quantity}${item.unit} @ ₹${item.rate} = ₹${item.amount}`
                        ).join('\n');
                    
                    // Send agent response
                    const agentMessage = new Message({
                        senderId,
                        receiverId,
                        text: billMessage,
                        replyTo: newMessage._id,
                    });
                    
                    await agentMessage.save();
                    agentResponse = agentMessage;
                    console.log('💾 Agent response saved:', agentResponse._id);
                    
                    // Emit to receiver
                    if (receiverSocketId) {
                        io.to(receiverSocketId).emit('newMessage', agentMessage);
                        io.to(receiverSocketId).emit('transactionCreated', result.transaction);
                    }
                }
            } catch (agentError) {
                console.error('Agent processing error:', agentError);
                // Send error message
                const errorMessage = new Message({
                    senderId,
                    receiverId,
                    text: `⚠️ Error processing order: ${agentError.message}`,
                    replyTo: newMessage._id,
                });
                await errorMessage.save();
                agentResponse = errorMessage;
            }
        }
        
        // Realtime functionality via socket.io
        if(receiverSocketId){
            io.to(receiverSocketId).emit('newMessage',newMessage);
        }

        console.log('📤 Returning response. agentResponse:', agentResponse ? agentResponse._id : 'null');
        res.status(200).json({ 
            message: newMessage,
            agentResponse 
        });

    } catch (error) {
        console.log('error in sendMessage', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}