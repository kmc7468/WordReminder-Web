const mongoose = require("mongoose");

const schema = new mongoose.Schema({
	username: String,
	password: String,

	vocabularies: [mongoose.Schema.Types.ObjectId],
});

const AccountModel = mongoose.model("account", schema);

module.exports = AccountModel;