const mongoose = require("mongoose");

const schema = new mongoose.Schema({
	username: String,
	password: String,
	token: String,

	vocabularies: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: "vocabulary",
	}],
});

const AccountModel = mongoose.model("account", schema);

module.exports = AccountModel;