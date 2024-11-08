import Sentence from '../../models/sentence.js';
import mongoose from 'mongoose';
const createSentenceEntry = async (req, res) => {
    try {
        const { spanish, kichwa, subject, particle, verb, lecture, time, options } = req.body;
        const newSentence = new Sentence({
            spanish, kichwa, subject, particle, verb, lecture, time, options
        });
        const sentence = await Sentence.findOne({ spanish: req.body.spanish });
        if (sentence) {
            return res.status(400).json({ message: 'Duplicate entry found' });
        }
        const savedSentence = await newSentence.save();
        res.status(201).json(savedSentence);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Duplicate entry found' });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

const getSentenceList = async (req, res) => {
    try {
        let query = {};

        if (req.query.lecture) {
            query.lecture = req.query.lecture;
        }  

        if (req.query.lectures) {
            query.lecture = { $in: req.query.lectures.split(',') };
        }           

        if (req.query.spanish) {
            query.kichwa = { $regex: `^${req.query.translate}`, $options: 'i' };
        } 
        
        if (req.query.kichwa) {
            query.kichwa = { $regex: `^${req.query.translate}`, $options: 'i' };
        } 
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1000;
        const skip = (page - 1) * limit;
        

        const sort = req.query.sort || 'translate';
        const sortOrder = req.query.sortOrder || 'desc';

        const sentenceList = await Sentence.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ [sort]: sortOrder });

        res.json(sentenceList);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};



const getSentenceEntry = async (req, res) => {
    try {
        const sentence = await Sentence.findById(req.params.id);
        if (!sentence) {
            res.status(404).json({ message: 'Word not found' });
        } else {
            res.json(sentence);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

const patchSentenceEntry = async (req, res) => {
    try {
        const { spanish, kichwa, subject, particle, verb, time, options } = req.body;
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid ID is required' });
        }
        let sentenceEntry = await Sentence.findById(id);
        if (!sentenceEntry) {
            return res.status(404).json({ message: 'Sentence entry not found' });
        }
        if (spanish) sentenceEntry.spanish = spanish;
        if (kichwa) sentenceEntry.kichwa = kichwa;
        if (subject) sentenceEntry.subject = subject; 
        if (particle) sentenceEntry.particle = particle;                  
        if (verb) sentenceEntry.verb = verb;
        if (time) sentenceEntry.time = time;
        if (options) sentenceEntry.options = options;        
        const updatedEntry = await sentenceEntry.save();
        res.json(updatedEntry);
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server Error' });
    }
};

const deleteSentenceEntry = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Valid ID is required' });
        }
        const deletedSentence = await Sentence.findByIdAndDelete(req.params.id);
        if (!deletedSentence) {
            res.status(404).json({ message: 'Word not found' });
        } else {
            res.json({ message: 'Sentence deleted successfully' });
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
        const sentenceList = await Sentence.aggregate([
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
        const response = await Promise.all(sentenceList.map(async (sentence) => {
            const option = Math.floor(Math.random() * 2);
            var question = {}
            console.log(option === 1)
            if (option === 1) {
                question['question'] = `¿Cuál es la traducción de la siguiente oración \"${sentence['kichwa']}\" en español?`
                question['answer'] = sentence['spanish']
                if (options) {
                    question['options'] = await Sentence.aggregate([
                        {
                            $match: {
                                lecture: { $in: lecture_list },
                                spanish: { $ne: sentence['spanish'] }
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
                    question['options'].push(sentence['spanish'])
                }
            } else {
                question['question'] = `¿Cuál es la traducción de la siguiente oración \"${sentence['spanish']}\" en kichwa?`
                question['answer'] = sentence['kichwa']
                if (options) {
                    question['options'] = await Sentence.aggregate([
                        {
                            $match: {
                                lecture: { $in: lecture_list },
                                kichwa: { $ne: sentence['kichwa'] }
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
                    question['options'].push(sentence['kichwa'])
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

const getQuestionTime = async (req, res) => {
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
        const sentenceList = await Sentence.aggregate([
            { $match: { lecture: { $in: lecture_list } } },
            { $sample: { size: size } },
            {
                $project: {
                    _id: 0,
                    kichwa: 1,
                    time: 1,                                        
                }
            }
        ])
        const response = await Promise.all(sentenceList.map(async (sentence) => {            
            var question = {}                        
                question['question'] = `¿En que tiempo se encuentra la siguiente oración  \"${sentence['kichwa']}\" ?`
                question['answer'] = sentence['time']
                if (options) {
                    question['options'] = await Sentence.aggregate([
                        {
                            $match: {
                                lecture: { $in: lecture_list },
                                time: { $ne: sentence['time'] }
                            }
                        },
                        { $sample: { size: options - 1 } },
                        {
                            $project: {
                                _id: 0,
                                time: 1,
                            }
                        }
                    ]).then(results => results.map(item => item.time));
                    question['options'].push(sentence['time'])
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

export { getSentenceList, createSentenceEntry, getSentenceEntry, patchSentenceEntry, deleteSentenceEntry, getQuestion, getQuestionTime };
