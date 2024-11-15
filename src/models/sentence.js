import mongoose from 'mongoose';

const sentenceSchema = new mongoose.Schema({    
    spanish: {
        type: String,
        required: true,
        unique: true
    },
    kichwa: {
        type: String,
        required: true,
        unique: true
    },
    subject: {
        type: String,    
        required: true,    
    },
    particle: {
        type: String,
    },   
    verb: {
        type: String,
    },
    lecture: {
        type: String,
        required: true,
    },
    time: {
        type: String,
    },
    options: {
        type: Array,
    },   
},
    { strict: process.env.STRICT === "1" }
);
const Sentence = mongoose.model('Sentence', sentenceSchema);

export default Sentence;