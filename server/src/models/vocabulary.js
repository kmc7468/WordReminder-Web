const mongoose = require("mongoose");

const meaningSchema = new mongoose.Schema({
	meaning: String,
	pronunciation: String,
	example: String,
	tags: [String],
});

const wordSchema = new mongoose.Schema({
	word: String,
	meanings: [meaningSchema],
});

const tagSchema = new mongoose.Schema({
	tag: String,
	words: [wordSchema],
	meanings: [meaningSchema],
});

const vocabularySchema = new mongoose.Schema({
	account: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "account",
	},

	name: String,
	version: {
		type: Number,
		default: 0,
	},
	time: Date,
	words: [wordSchema],
	tags: [tagSchema],
});

const VocabularyModel = mongoose.model("vocabulary", vocabularySchema);

module.exports = VocabularyModel;