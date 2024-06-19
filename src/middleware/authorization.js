import dotenv from 'dotenv';
dotenv.config();
const apiKey = process.env.API_KEY;

const checkApiKey = (req, res, next) => {
    const requestKey = req.headers['authorization'];
    if (!requestKey || requestKey !== apiKey) {
        return res.status(403).json({ error: 'Forbidden - Invalid API Key' });
    }
    next();
};

export default checkApiKey;