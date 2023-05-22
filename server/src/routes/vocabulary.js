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
	};

	get = async (id) => {
		try {
			const result = await VocabularyModel.findOne({ _id: id });

			if (result) return { success: true, data: result };
			else return { success: false, data: "Invalid vocabularyId" };
		} catch (e) {
			console.log(`[VocabularyDB] get call failed: DB Error - ${ e }`);

			return { success: false, data: "DB Error" };
		}
	};

	// content 필수 항목: word, meaning
	// content 선택 항목: pronunciation, example
	addMeaning = async (vocabulary, content) => {
		try {
			if (!vocabulary.words) {
				vocabulary.words = [];

				await vocabulary.save(); // TODO: 예외 처리 안됨
			}

			const word = vocabulary.words.find((word) => word.word === content.word);	
			if (word) {
				if (!word.meanings) {
					word.meanings = [];

					await vocabulary.save(); // TODO: 예외 처리 안됨
				}

				const meaning = word.meanings.find((meaning) => meaning.meaning === content.meaning);
				if (!meaning) {
					word.meanings.push({
						meaning: content.meaning,
						pronunciation: content.pronunciation,
						example: content.example,
					});

					await vocabulary.save(); // TODO: 예외 처리 안됨

					return { success: true };
				} else return { success: false, data: "Already exist meaning" };
			} else {
				vocabulary.words.push({
					word: content.word,
					meanings: [{
						meaning: content.meaning,
						pronunciation: content.pronunciation,
						example: content.example,
					}]
				});

				await vocabulary.save(); // TODO: 예외 처리 안됨

				return { success: true };
			}
		} catch (e) {
			console.log(`[VocabularyDB] addMeaning call failed: DB Error - ${ e }`);

			return { success: false, data: "DB Error" };
		}
	};
};

const vocabularyDBInst = VocabularyDB.getInst();

router.post("/create", accountMiddleware, async (req, res) => {
	try {
		const name = req.body.vocabularyName;
		if (!name || name.length === 0) return res.status(400).json({ error: "Empty vocabularyName" });

		const result = await vocabularyDBInst.create(res.locals.user, name);

		if (result.success) {
			res.locals.user.vocabularies.push(result.data._id);
			await res.locals.user.save(); // TODO: 예외 처리 안됨

			return res.status(200).json({ id: result.data._id.toHexString() });
		} else return res.status(500).json({ error: result.data });
	} catch (e) {
		console.log(`[VocabularyRouter] create call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

router.get("/getVocabularies", accountMiddleware, async (req, res) => {
	try {
		const vocabularies = [];

		for (let i = 0; i < res.locals.user.vocabularies.length; ++i) {
			const vocabulary = await vocabularyDBInst.get(res.locals.user.vocabularies[i]);
			if (!vocabulary.success) return res.status(500).json({ error: vocabulary.data });

			vocabularies.push({
				id: vocabulary.data._id.toHexString(),
				name: vocabulary.data.name,
				time: vocabulary.data.time,
			});
		}

		return res.status(200).json({ vocabularies });
	} catch (e) {
		console.log(`[VocabularyRouter] getVocabularies call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

router.post("/addMeaning", accountMiddleware, async (req, res) => {
	try {
		const id = req.body.vocabularyId;
		if (!id || id.length === 0) return res.status(400).json({ error: "Empty vocabularyId" });

		const vocabulary = await vocabularyDBInst.get(id);
		if (!vocabulary.success) return res.status(400).json({ error: vocabulary.data });

		const word = req.body.word;
		if (!word || word.length === 0) return res.status(400).json({ error: "Empty word" });

		const meaning = req.body.meaning;
		if (!meaning || meaning.length === 0) return res.status(400).json({ error: "Empty meaning" });

		let pronunciation = req.body.pronunciation;
		if (!pronunciation || pronunciation && pronunciation.length === 0) {
			pronunciation = null;
		}

		let example = req.body.example;
		if (!example || example && example.length === 0) {
			example = null;
		}

		const result = await vocabularyDBInst.addMeaning(vocabulary.data, {
			word,
			meaning,
			pronunciation,
			example,
		});

		if (result.success) {
			++vocabulary.data.version;

			await vocabulary.data.save(); // TODO: 예외 처리 안됨

			return res.status(200).json({});
		} else return res.status(500).json({ error: result.data });
	} catch (e) {
		console.log(`[VocabularyRouter] addMeaning call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

router.get("/getWords", accountMiddleware, async (req, res) => {
	try {
		const id = req.body.vocabularyId;
		if (!id || id.length === 0) return res.status(400).json({ error: "Empty vocabularyId" });

		const vocabulary = await vocabularyDBInst.get(id);
		if (!vocabulary.success) return res.status(400).json({ error: vocabulary.data });

		const words = [];

		if (vocabulary.data.words) {
			for (let i = 0; i < vocabulary.data.words.length; ++i) {
				words.push(vocabulary.data.words[i].word);
			}
		}

		return res.status(200).json({ words });
	} catch (e) {
		console.log(`[VocabularyRouter] getVocabularies call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

router.get("/getMeanings", accountMiddleware, async (req, res) => {
	try {
		const id = req.body.vocabularyId;
		if (!id || id.length === 0) return res.status(400).json({ error: "Empty vocabularyId" });

		const vocabulary = await vocabularyDBInst.get(id);
		if (!vocabulary.success) return res.status(400).json({ error: vocabulary.data });

		const wordString = req.body.word;
		if (!wordString || wordString.length === 0) return res.status(400).json({ error: "Empty word" });
		if (!vocabulary.data.words) return res.status(400).json({ error: "Nonexist word" });

		const word = vocabulary.data.words.find((word) => word.word === wordString);
		if (!word) return res.status(400).json({ error: "Nonexist word" });

		const meanings = [];

		if (word.meanings) {
			for (let i = 0; i < word.meanings.length; ++i) {
				meanings.push({
					meaning: word.meanings[i].meaning,
					pronunciation: word.meanings[i].pronunciation,
					example: word.meanings[i].example,
					tags: word.meanings[i].tags,
				});
			}
		}

		return res.status(200).json({ meanings });
	} catch (e) {
		console.log(`[VocabularyRouter] getVocabularies call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

module.exports = router;