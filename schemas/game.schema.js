const mongoose = require("mongoose");
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

const Schema = new mongoose.Schema({
    id: {type: Number,unique: false, required: true},
    title: String, // Title name
    image: { type: String, required: true }, // Image name
    url: { type: String, required: true }, // Url Slug
    developer: {type: String, required: true}, // Developer
    released: {type: String, required: true},
    plataform: {type: String, required: true}, // Plataform (steam,origin,blizzard)
    trailer: {type: String, default: null, required: true}, // Trailer if has
    description: { type: String, default: null }, // Description
    views: {type: Number, default: 0, required: true}, // Article views
    system: {type: Object, default: {
        processor: null,
        graphic_driver: null,
        os: null,
        storage: null,
        ram: null,
    }, required: true},
    crawl_info: {type: Object, default: {
        last_crawl: Date.now(),
        app_id: null,
    }, required: true}
}, {
    collection: "games"
})


module.exports = mongoose.model('Game', Schema)