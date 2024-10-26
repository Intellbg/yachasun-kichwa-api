import Word from '../../models/Word.js';
import mongoose from 'mongoose';
const createWordEntry = async (req, res) => {
    try {
        const { kichwa, spanish, english, lecture, tags, imagen, audio } = req.body;
        const newWord = new Word({
            kichwa, spanish, english, lecture, tags, imagen, audio
        });
        const word = await Word.findOne({ kichwa: req.body.kichwa });
        if (word) {
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
        
        if (req.query.lectures) {
            query.lecture = { $in: req.query.lectures.split(',') };
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

const getQuestion = async (req, res) => {
    try {
        const { lectures } = req.query;
        const lecture_list = lectures ? lectures.split(',') : [];
        const isArrayOfChars = Array.isArray(lecture_list) && lecture_list.every(item => typeof item === 'string');
        const size = req.query.size ? Number(req.query.size) : 1;
        const options = req.query.options ? Number(req.query.options) : null;
        if (!isArrayOfChars) {
            return res.status(400).send('The parameter is not an array of characters.');
        }
        console.log(lecture_list)
        const wordList = await Word.aggregate([
            { $match: { lecture: { $in: lecture_list } } },
            { $sample: { size: size } },
            {
                $project: {
                    _id: 0,
                    kichwa: 1,
                    spanish: 1,
                }
            }
        ])
        const response = await Promise.all(wordList.map(async (word) => {
            const is_spanish = Math.floor(Math.random() * 2);
            var question = {}
            console.log(is_spanish === 1)
            if (is_spanish === 1) {
                question['question'] = `¿Cuál es la traducción de \"${word['kichwa']}\" en español?`
                question['answer'] = word['spanish']
                if (options) {
                    question['options'] = await Word.aggregate([
                        {
                            $match: {
                                lecture: { $in: lecture_list },
                                spanish: { $ne: word['spanish'] }
                            }
                        },
                        { $sample: { size: options - 1 } },
                        {
                            $project: {
                                _id: 0,
                                spanish: 1,
                            }
                        }
                    ]).then(results => results.map(item => item.spanish));
                    question['options'].push(word['spanish'])
                }
            } else {
                question['question'] = `¿Cuál es la traducción de \"${word['spanish']}\" en kichwa?`
                question['answer'] = word['kichwa']
                if (options) {
                    question['options'] = await Word.aggregate([
                        {
                            $match: {
                                lecture: { $in: lecture_list },
                                kichwa: { $ne: word['kichwa'] }
                            }
                        },
                        { $sample: { size: options - 1 } },
                        {
                            $project: {
                                _id: 0,
                                kichwa: 1,
                            }
                        }
                    ]).then(results => results.map(item => item.kichwa));
                    question['options'].push(word['kichwa'])
                }
            }
            console.log(question)
            return question
        }))
        res.json(response);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error s' });
    }
};

export { getWordList, createWordEntry, getWordEntry, patchWordEntry, deleteWordEntry, getQuestion };
