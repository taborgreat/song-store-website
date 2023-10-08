const mongoose =  require("mongoose");

const Schema = mongoose.Schema;

const SongSchema = new Schema({
    title: { type: String, required: true },
    artist: {type: Schema.Types.ObjectId, ref: "Artist", required: true },
    key: { type: String },
    bpm: { type: String, maxLength: 3 },
    genre: { type: Schema.Types.ObjectId, ref: "Genre"},
    description: { type: String, maxLength: 500 },
    //sale price, purchased by,

})

SongSchema.virtual("url").get(function(){
    return `/catalog/song/${this._id}`
})

module.exports = mongoose.model("Song", SongSchema);