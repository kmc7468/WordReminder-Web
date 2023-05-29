const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const VocabularyModel = require("../models/vocabulary");
const vocabularyParser = require("../utility/vocabularyParser");

const accountMiddleware = require("../middleware/account");

const router = express.Router();
const upload = multer({
	dest: __dirname + "/files/",
});

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
	};

	create = async (user, name) => {
		try {
			for (let i = 0; i < user.vocabularies.length; ++i) {
				const vocabulary = await VocabularyModel.findOne({ _id: user.vocabularies[i] });
				if (vocabulary.name === name) return { success: false, code: 400, data: "Already used vocabularyName" };
			}

			const newVocabulary = new VocabularyModel({ name, account: user._id, words: [], tags: [] });
			await newVocabulary.save(); // TODO: 예외 처리 안됨

			return { success: true, data: newVocabulary };
		} catch (e) {
			console.log(`[VocabularyDB] create call failed: DB Error - ${ e }`);

			return { success: false, code: 500, data: "DB Error" };
		}
	};

	delete = async (id) => {
		try {
			const result = await VocabularyModel.deleteOne({ _id: id });
			if (result.deletedCount === 1) return { success: true };
			else {
				const vocabulary = await VocabularyModel.findOne({ _id: id });

				if (!vocabulary) return { success: false, code: 400, data: "Nonexist vocabulary" };
				else return { success: false, code: 500, data: "DB Error" };
			}
		} catch (e) {
			console.log(`[VocabularyDB] delete call failed: DB Error - ${ e }`);

			return { success: false, code: 500, data: "DB Error" };
		}
	};

	get = async (id) => {
		try {
			const result = await VocabularyModel.findOne({ _id: id });

			if (result) return { success: true, data: result };
			else return { success: false, code: 400, data: "Invalid vocabularyId" };
		} catch (e) {
			console.log(`[VocabularyDB] get call failed: DB Error - ${ e }`);

			return { success: false, code: 500, data: "DB Error" };
		}
	};

	// content 필수 항목: word, meaning
	// content 선택 항목: pronunciation, example
	addMeaning = async (vocabulary, content) => {
		try {
			const word = vocabulary.words.find((word) => word.word === content.word);	
			if (word) {
				const meaning = word.meanings.find((meaning) => meaning.meaning === content.meaning);
				if (!meaning) {
					word.meanings.push({
						meaning: content.meaning,
						pronunciation: content.pronunciation,
						example: content.example,
						tags: [],
					});

					await vocabulary.save(); // TODO: 예외 처리 안됨

					return { success: true };
				} else return { success: false, code: 400, data: "Already exist meaning" };
			} else {
				vocabulary.words.push({
					word: content.word,
					meanings: [{
						meaning: content.meaning,
						pronunciation: content.pronunciation,
						example: content.example,
						tags: [],
					}],
					relations: [],
				});

				await vocabulary.save(); // TODO: 예외 처리 안됨

				return { success: true };
			}
		} catch (e) {
			console.log(`[VocabularyDB] addMeaning call failed: DB Error - ${ e }`);

			return { success: false, code: 500, data: "DB Error" };
		}
	};

	removeMeaning = async (vocabulary, wordString, meaningString) => {
		try {
			const word = vocabulary.words.find((word) => word.word === wordString);
			if (!word) return { success: false, code: 400, data: "Nonexist word" };

			if (meaningString === "*") { // 단어 삭제(수동)
				vocabulary.words = vocabulary.words.filter((word) => word.word !== wordString);

				await vocabulary.save(); // TODO: 예외 처리 안됨

				return { success: true };
			}
			
			const meaningCount = word.meanings.length;

			word.meanings = word.meanings.filter((meaning) => meaning.meaning !== meaningString);

			if (word.meanings.length === 0) { // 단어 삭제
				vocabulary.words = vocabulary.words.filter((word) => word.word !== wordString);

				await vocabulary.save(); // TODO: 예외 처리 안됨

				return { success: true };
			} else if (word.meanings.length !== meaningCount) {
				await vocabulary.save(); // TODO: 예외 처리 안됨

				return { success: true };
			} else return { success: false, code: 400, data: "Nonexist meaning" };
		} catch (e) {
			console.log(`[VocabularyDB] removeMeaning call failed: DB Error - ${ e }`);

			return { success: false, code: 500, data: "DB Error" };
		}
	};
};

const vocabularyDBInst = VocabularyDB.getInst();

router.post("/createVocabulary", accountMiddleware, async (req, res) => {
	try {
		const name = req.body.vocabularyName;
		if (!name || name.length === 0) return res.status(400).json({ error: "Empty vocabularyName" });

		const result = await vocabularyDBInst.create(res.locals.user, name);
		if (result.success) {
			res.locals.user.vocabularies.push(result.data._id);
			await res.locals.user.save(); // TODO: 예외 처리 안됨

			return res.status(200).json({ id: result.data._id.toHexString() });
		} else return res.status(result.code).json({ error: result.data });
	} catch (e) {
		console.log(`[VocabularyRouter] createVocabulary call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

router.post("/uploadVocabulary", accountMiddleware, upload.single("file"), async (req, res) => {
	const filePath = path.resolve(req.file.destination, req.file.filename);
	let fileDeleted = false;

	try {
		const name = req.body.vocabularyName;
		if (!name || name.length === 0) return res.status(400).json({ error: "Empty vocabularyName" });

		const vocabulary = await vocabularyParser(filePath);

		fileDeleted = true;
		fs.unlinkSync(filePath);

		const result = await vocabularyDBInst.create(res.locals.user, name);
		if (result.success) {
			res.locals.user.vocabularies.push(result.data._id);
			await res.locals.user.save(); // TODO: 예외 처리 안됨

			vocabulary.words.forEach((word) => {
				const meanings = [];
				
				word.meanings.forEach((meaning) => {
					meanings.push({
						meaning: meaning.meaning,
						pronunciation: meaning.pronunciation,
						example: meaning.example,
						tags: [],
					});
				});

				result.data.words.push({
					word: word.word,
					meanings,
					relations: [],
				});

				word.object = result.data.words.at(-1);

				for (let i = 0; i < word.meanings.length; ++i) {
					word.meanings[i].object = word.object.meanings[i];
				}
			});

			result.data.tags = vocabulary.tags;

			vocabulary.words.forEach((word) => {
				word.meanings.forEach((meaning) => {
					meaning.tags.forEach((tag) => {
						meaning.object.tags.push(result.data.tags[tag]);
					});
				});
				word.relations.forEach((relation) => {
					word.object.relations.push({
						word: result.data.words[relation.word].word,
						relation: relation.relation,
					});
				});
			});

			await result.data.save(); // TODO: 예외 처리 안됨

			return res.status(200).json({ id: result.data._id.toHexString() });
		} else return res.status(result.code).json({ error: result.data });
	} catch (e) {
		console.log(`[VocabularyRouter] uploadVocabulary call failed: ${ e }`);

		if (!fileDeleted) {
			fs.unlinkSync(filePath);
		}

		return res.status(500).json({ error: e });
	}
});

router.post("/deleteVocabulary", accountMiddleware, async (req, res) => {
	try {
		const id = req.body.vocabularyId;
		if (!id || id.length === 0) return res.status(400).json({ error: "Empty vocabularyId" });

		const result = await vocabularyDBInst.delete(id);
		if (result.success) {
			res.locals.user.vocabularies = res.locals.user.vocabularies.filter((voca) => voca.toHexString() !== id);
			await res.locals.user.save(); // TODO: 예외 처리 안됨

			return res.status(200).json({});
		} else return res.status(result.code).json({ error: result.data });
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
			if (!vocabulary.success) return res.status(vocabulary.code).json({ error: vocabulary.data });

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
		if (!vocabulary.success) return res.status(vocabulary.code).json({ error: vocabulary.data });

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
		} else return res.status(result.code).json({ error: result.data });
	} catch (e) {
		console.log(`[VocabularyRouter] addMeaning call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

router.post("/removeMeaning", accountMiddleware, async (req, res) => {
	try {
		const id = req.body.vocabularyId;
		if (!id || id.length === 0) return res.status(400).json({ error: "Empty vocabularyId" });

		const vocabulary = await vocabularyDBInst.get(id);
		if (!vocabulary.success) return res.status(vocabulary.code).json({ error: vocabulary.data });

		const word = req.body.word;
		if (!word || word.length === 0) return res.status(400).json({ error: "Empty word" });

		const meaning = req.body.meaning;
		if (!meaning || meaning.length === 0) return res.status(400).json({ error: "Empty meaning" });

		const result = await vocabularyDBInst.removeMeaning(vocabulary.data, word, meaning);

		if (result.success) {
			++vocabulary.data.version;

			await vocabulary.data.save(); // TODO: 예외 처리 안됨

			return res.status(200).json({});
		} else return res.status(result.code).json({ error: result.data });
	} catch (e) {
		console.log(`[VocabularyRouter] removeMeaning call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

router.get("/getMeanings", accountMiddleware, async (req, res) => {
	try {
		const id = req.query.vocabularyId;
		if (!id || id.length === 0) return res.status(400).json({ error: "Empty vocabularyId" });

		const vocabulary = await vocabularyDBInst.get(id);
		if (!vocabulary.success) return res.status(vocabulary.code).json({ error: vocabulary.data });

		const words = vocabulary.data.words.map((word) => {
			return {
				word: word.word,
				meanings: word.meanings.map((meaning) => {
					return {
						meaning: meaning.meaning,
						pronunciation: meaning.pronunciation,
						example: meaning.example,
						tags: meaning.tags,
					};
				}),
				relations: word.relations.map((relation) => {
					return {
						word: relation.word,
						relation: relation.relation
					};
				}),
			};
		});

		return res.status(200).json({ meanings: words });
	} catch (e) {
		console.log(`[VocabularyRouter] getMeanings call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

router.get("/getMeaningsCount", accountMiddleware, async (req, res) => {
	try {
		const id = req.query.vocabularyId;
		if (!id || id.length === 0) return res.status(400).json({ error: "Empty vocabularyId" });

		const vocabulary = await vocabularyDBInst.get(id);
		if (!vocabulary.success) return res.status(vocabulary.code).json({ error: vocabulary.data });

		return res.status(200).json({ count: vocabulary.data.words.length });
	} catch (e) {
		console.log(`[VocabularyRouter] getMeaningsCount call failed: ${ e }`);

		return res.status(500).json({ error: e });
	}
});

module.exports = router;