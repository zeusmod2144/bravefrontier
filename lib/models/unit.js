const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
    id: String,
    name: String,
    link: String,
    thumbnail: String,
    element: String,
    rarity: String,
    artwork: String,
    spRecommendation: []
});

module.exports = mongoose.model('Unit', unitSchema);