import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import connectDB from './config/mongo.js';
import wordRoutesV1 from "./routes/v1/wordRoutes.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(bodyParser.json());

app.use('/api/v1/word', wordRoutesV1);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
