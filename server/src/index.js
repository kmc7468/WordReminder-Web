const cookies = require("cookie-parser")
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const accountRouter = require("./routes/account");
const vocabularyRouter = require("./routes/vocabulary");

const app = express();
const port = process.env.PORT;

app.use(cookies());
app.use(express.json());

const whitelist = [ process.env.FRONTEND_URI ];
const corsOptions = {
	origin: (origin, callback) => {
		console.log("[REQUEST-CORS] Request from origin: ", origin);
		if (!origin || whitelist.indexOf(origin) !== -1) callback(null, true);
		else callback(new Error("Not allowed by CORS"));
	},
	credentials: true,
}

app.use(cors(corsOptions));

app.use("/account", accountRouter.router);
app.use("/vocabulary", vocabularyRouter);

app.use("/static", express.static(path.join(__dirname, "public")));

const mongooseOption = { useNewUrlParser: true, useUnifiedTopology: true };
mongoose.connect(process.env.MONGO_URI, mongooseOption).then(
	() => { console.log("[Mongoose] Connection complete!"); },
	(error) => { console.log(`[Mongoose] Connection failed: ${ error }`); },
);

app.listen(port, () => {
	console.log(`[Express] Listening start! @ http://localhost:${ port }`);
});