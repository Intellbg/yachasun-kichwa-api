import express from 'express';
import User from '../../models/User.js';

const router = express.Router();

router.patch('/:id/level', async (req, res) => {
    try {
        const userId = req.params.id;
        const { level } = req.body;
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: 'No authorization header' });
        }
        console.log(authHeader)
        const user = await User.findOne({ _id: userId, auth_key: authHeader });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (typeof level !== 'number' || isNaN(level)) {
            return res.status(400).json({ message: 'Invalid input: level must be a number' });
        }
        user.level = level;
        user.save()
        return res.status(200).json({ message: 'User level updated', level });
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router;
