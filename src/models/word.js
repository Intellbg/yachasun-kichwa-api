import mongoose from 'mongoose';

const wordSchema = new mongoose.Schema({
    kichwa: {
        type: String,
        required: true,
        unique: true
    },
    spanish: {
        type: String,
        required: true,
    },
    english: {
        type: String,
    },
    lecture: {
        type: Array,
    },
    tags: {
        type: Array,
    },
    audio: {
        type: String,
    },
    image: {
        type: String,
    }
},
    { strict: process.env.STRICT === "1" }
);
const Word = mongoose.model('Word', wordSchema);

export default Word;
