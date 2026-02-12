import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import dotenv from 'dotenv';
dotenv.config();

export const protectroute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized access-no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized access-token verification failed' });
        }

        const user=await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(404).json({message:'User not found'})
        }

        req.user=user;
        next();

    } catch (error) {
        console.log('error in protectroute', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}