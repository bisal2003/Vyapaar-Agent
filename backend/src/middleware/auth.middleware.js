import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import dotenv from 'dotenv';
dotenv.config();

export const protectRoute = async (req, res, next) => {
    try {
        // Demo mode - check for X-Demo-User header
        const demoUserHeader = req.headers['x-demo-user'];
        
        if (demoUserHeader) {
            try {
                req.user = JSON.parse(demoUserHeader);
                return next();
            } catch (parseError) {
                console.log('Error parsing demo user header:', parseError);
            }
        }
        
        const token = req.cookies.jwt;
        
        // Demo mode - if no token and no header, create a demo user
        if (!token) {
            req.user = {
                _id: 'demo-seller',
                fullName: 'Demo Seller',
                email: 'seller@demo.com',
                profilePic: 'https://avatar.iran.liara.run/public/boy?username=seller'
            };
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            req.user = {
                _id: 'demo-seller',
                fullName: 'Demo Seller',
                email: 'seller@demo.com',
                profilePic: 'https://avatar.iran.liara.run/public/boy?username=seller'
            };
            return next();
        }

        const user=await User.findById(decoded.userId).select("-password");
        if(!user){
            req.user = {
                _id: 'demo-seller',
                fullName: 'Demo Seller',
                email: 'seller@demo.com',
                profilePic: 'https://avatar.iran.liara.run/public/boy?username=seller'
            };
            return next();
        }

        req.user=user;
        next();

    } catch (error) {
        console.log('error in protectRoute', error);
        req.user = {
            _id: 'demo-seller',
            fullName: 'Demo Seller',
            email: 'seller@demo.com',
            profilePic: 'https://avatar.iran.liara.run/public/boy?username=seller'
        };
        next();
    }
}