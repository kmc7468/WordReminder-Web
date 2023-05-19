const mongoose = require("mongoose");

const meaningSchema = new mongoose.Schema({
	word: mongoose.Schema.Types.ObjectId,

	meaning: String,
	pronunciation: String,
	example: String,
	tags: [mongoose.Schema.Types.ObjectId],
});

const wordSchema = new mongoose.Schema({
	vocabulary: mongoose.Schema.Types.ObjectId,
	
	word: String,
	meanings: [meaningSchema],
});

const tagSchema = new mongoose.Schema({
	vocabulary: mongoose.Schema.Types.ObjectId,

	tag: String,
	words: [wordSchema],
	meanings: [meaningSchema],
});

const vocabularySchema = new mongoose.Schema({
	name: String,
	time: Date,
	words: [wordSchema],
	tags: [tagSchema],
});

const VocabularyModel = mongoose.model("vocabulary", vocabularySchema);

module.exports = VocabularyModel;