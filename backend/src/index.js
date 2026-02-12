import express from 'express';
import authroutes from './routes/auth.routes.js'
import messageroutes from './routes/message.route.js'
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import {app,server} from './lib/socket.js';
import path from 'path';

dotenv.config();



const PORT=process.env.PORT || 5001;
const __dirname = path.resolve();

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use('/api/auth',authroutes)
app.use('/api/messages',messageroutes)

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname,'../frontend/dist')));

    app.get('*',(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html"));
    })
}

server.listen(PORT, () => {
    console.log('Server running on port: ', PORT);
    connectDB();
})