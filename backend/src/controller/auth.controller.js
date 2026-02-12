import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.models.js";
import bcrypt from 'bcryptjs';

export const signup = async (req, res) => {
    const { email, fullname, password } = req.body;

    try {
        if (!email || !fullname || !password) {
            return res.status(400).json({ message: 'all fields are mandatory' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ email, fullname, password: hashedPassword });
        if (newUser) {
            //generate jwt token here
            generateToken(newUser._id, res);

            await newUser.save();

            res.status(200).json({
                _id: newUser._id,
                email: newUser.email,
                fullname: newUser.fullname,
                profilePic: newUser.profilePic
            });

        }
        else {
            return res.status(400).json({ message: 'Failed to create user' });
        }
    } catch (error) {
        console.log('error in signup', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const ispasswordMatch = await bcrypt.compare(password, user.password);
        if (!ispasswordMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        generateToken(user._id, res);
        res.status(200).json({
            _id: user._id,
            email: user.email,
            fullname: user.fullname,
            profilePic: user.profilePic
        });
    } catch (error) {
        console.log('error in login', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const logout = async(req, res) => {
    try {
        res.cookie("jwt","", {maxAge: 0});
        res.status(200).json({message: 'Logged out successfully'});     
    } catch (error) {
        console.log('error in logout', error.message);  
        res.status(500).json({message: 'Internal server error'});
    }
}

export const updateProfile = async(req, res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;
        if(!profilePic){
            return res.status(400).json({message: 'Profile pic is required'});
        }

        const uploadResponse=await cloudinary.uploader.upload(profilePic, {
            resource_type: 'auto',
            type: 'upload',
            invalidate: true
        });
        const updatedResponse=await User.findByIdAndUpdate(
            userId,
            {profilePic: uploadResponse.secure_url},
            {new: true} 
        ).select('-password');
        res.status(200).json(updatedResponse);
    } catch (error) {
        console.log('error in updateProfile', error.message);
        res.status(500).json({message: 'Internal server error'});
    }
}

export const checkAuth = async(req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.log('error in check', error.message);
        res.status(500).json({message: 'Internal server error'});
    }
}