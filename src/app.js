import express from 'express';
import session from 'express-session';
import passport from 'passport';

import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import connectDB from './config/mongo.js';
import './config/passport.js';

import wordRoutesV1 from "./routes/v1/word.js"
import authRoutesV1 from "./routes/v1/auth.js"
import userRoutesV1 from "./routes/v1/user.js"

import cors from "cors"

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(bodyParser.json());
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1/word', wordRoutesV1);
app.use('/api/v1/auth', authRoutesV1);
app.use('/api/v1/user', userRoutesV1);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
