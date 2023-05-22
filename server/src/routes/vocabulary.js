const express = require("express");
const VocabularyModel = require("../models/vocabulary");

const accountMiddleware = require("../middleware/account");

const router = express.Router();

class VocabularyDB {
	static _inst_;
	static getInst = () => {
		if (!VocabularyDB._inst_) {
			VocabularyDB._inst_ = new VocabularyDB();
		}

		return VocabularyDB._inst_;
	};

	constructor() {
		console.log("[VocabularyDB] DB initialization complete!");
	}

	create = async (user, name) => {
		try {
			for (let i = 0; i < user.vocabularies.length; ++i) {
				const vocabulary = await VocabularyModel.findOne({ _id: user.vocabularies[i] });
				if (vocabulary.name === name) return { success: false, data: "Already used vocabularyName" };
			}

			const newVocabulary = new VocabularyModel({ name, account: user._id });
			await newVocabulary.save(); // TODO: 예외 처리 안됨

			return { success: true, data: newVocabulary };
		} catch (e) {
			console.log(`[VocabularyDB] create call failed: DB Error - ${ e }`);

			return { success: false, data: "DB Error" };
		}
	}
};

const vocabularyDBInst = VocabularyDB.getInst();

router.post("/create", accountMiddleware, async (req, res) => {
	try {
		const name = req.body.vocabularyName;
		if (!name || name.length === 0) {
			console.log("[VocabularyRouter] create call failed: Empty vocabularyName");

			return res.status(500).json({ error: "Empty vocabularyName" });
		}

		const result = await vocabularyDBInst.create(res.locals.user, name);

		if (result.success) {
			res.locals.user.vocabularies.push(result.data._id);
			await res.locals.user.save(); // TODO: 예외 처리 안됨

			return res.status(200).json({});
		} else return res.status(500).json({ error: result.data });
	} catch (e) {
		console.log(`[VocabularyRouter] create call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

module.exports = router;