import express from 'express';
import { checkAuth, login, logout, signup, updateProfile } from '../controller/auth.controller.js';
import { protectroute } from '../middleware/auth.middleware.js';

const router=express.Router();

router.post('/signup',signup)

router.post('/login',login)

router.post('/logout',logout)

router.put('/update-profile',protectroute,updateProfile)

router.get('/check',protectroute,checkAuth)

export default router;