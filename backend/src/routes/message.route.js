import express from 'express';
import { protectroute } from '../middleware/auth.middleware.js';
import { getMessages, getusersforSidebar, sendMessage } from '../controller/message.controller.js';

const router = express.Router();

router.get('/users',protectroute,getusersforSidebar);
router.get('/:id',protectroute,getMessages);
router.post('/send/:id' ,protectroute,sendMessage);

export default router;