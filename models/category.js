const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    ownerId: {
        type: String,
        required: [true, 'Owner ID is required'],
        trim: true
    },

})

module.exports = mongoose.model('Category', categorySchema);