import Word from '../../models/Word.js';
import mongoose from 'mongoose';
const createWordEntry = async (req, res) => {
    try {
        const { kichwa, spanish, english, lecture, tags, imagen, audio } = req.body;
        const newWord = new Word({
            kichwa, spanish, english, lecture, tags, imagen, audio
        });
        const word = await Word.findOne({kichwa: req.body.kichwa});
        if (word){
            return res.status(400).json({ message: 'Duplicate entry found' });
        }
        const savedWord = await newWord.save();
        res.status(201).json(savedWord);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Duplicate entry found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

const getWordList = async (req, res) => {
    try {
        let query = {};

        if (req.query.lecture) {
            query.lecture = req.query.lecture;
        }

        if (req.query.tags) {
            query.tags = { $in: req.query.tags.split(',') };
        }

        if (req.query.kichwa) {
            query.kichwa = { $regex: `^${req.query.kichwa}`, $options: 'i' };
        }

        if (req.query.spanish) {
            query.kichwa = { $regex: `^${req.query.spanish}`, $options: 'i' };
        }

        if (req.query.english) {
            query.kichwa = { $regex: `^${req.query.english}`, $options: 'i' };
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;

        const sort = req.query.sort || 'kichwa'; 
        const sortOrder = req.query.sortOrder || 'desc';

        const wordList = await Word.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ [sort]: sortOrder });

        res.json(wordList);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};



const getWordEntry = async (req, res) => {
    try {
        const word = await Word.findById(req.params.id);
        if (!word) {
            res.status(404).json({ message: 'Word not found' });
        } else {
            res.json(word);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const patchWordEntry = async (req, res) => {
    try {
        const { kichwa, spanish, english, lecture, tags, imagen, audio } = req.body;
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid ID is required' });
        }
        let wordEntry = await Word.findById(id);
        if (!wordEntry) {
            return res.status(404).json({ message: 'Word entry not found' });
        }
        if (kichwa) wordEntry.kichwa = kichwa;
        if (spanish) wordEntry.spanish = spanish;
        if (english) wordEntry.english = english;
        if (lecture) wordEntry.lecture = lecture;
        if (tags) wordEntry.tags = tags;
        if (tags) wordEntry.imagen = imagen;
        if (tags) wordEntry.audio = audio;
        const updatedEntry = await wordEntry.save();
        res.json(updatedEntry);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteWordEntry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid ID is required' });
        }
        const deletedWord = await Word.findByIdAndDelete(req.params.id);
        if (!deletedWord) {
            res.status(404).json({ message: 'Word not found' });
        } else {
            res.json({ message: 'Word deleted successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export { getWordList, createWordEntry, getWordEntry, patchWordEntry, deleteWordEntry };
