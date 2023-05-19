const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

const mongooseOption = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(process.env.MONGO_URI, mongooseOption).then(
	() => { console.log("[Mongoose] Connection complete!"); },
	(error) => { console.log(`[Mongoose] Connection failed: ${ error }`); },
);

app.listen(port, () => {
	console.log(`[Express] Listening start! @ http://localhost:${ port }`);
});