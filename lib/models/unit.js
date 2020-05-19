const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
    id: String,
    name: String,
    thumbnail: String,
    element: String,
    artwork: String,
    spRecommendation: []
});

module.exports = mongoose.model('Unit', unitSchema);