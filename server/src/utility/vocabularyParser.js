const fs = require("fs");

const parseVocabulary = async (path) => {
	const buffer = fs.readFileSync(path);
	const stream = {
		buffer,
		offset: 0,

		readInt: function() {
			const result = buffer.readInt32LE(this.offset);

			this.offset += 4;

			return result;
		},
		readString: function() {
			const length = this.readInt();
			if (length > 0) {
				const result = buffer.toString("utf16le", this.offset, this.offset + length * 2);

				this.offset += length * 2;
	
				return result;
			} else return null;
		},
	};

	const vocabulary = {
		words: [],
		tags: []
	};

	const wordCount = stream.readInt();
	for (let i = 0; i < wordCount; ++i) {
		const word = stream.readString();
		const pronunciation = stream.readString();
		const meaning = stream.readString();

		vocabulary.words.push({
			word,
			meanings: [{
				meaning,
				pronunciation,
				example: null,
				tags: [],
				relations: [],
			}],
			relations: [],
		});
	}

	let containerCount = 0;
	
	try {
		containerCount = stream.readInt();
	} catch (e) {
		return vocabulary;
	}

	for (let i = 0; i < containerCount; ++i) {
		const containerId = stream.readInt();
		const containerLength = stream.readInt();

		switch (containerId) {
		case 0: // HOMONYM_CONTAINER
			vocabulary.words.forEach((word) => {
				word.meanings = [];

				const meaningCount = stream.readInt();
				for (let k = 0; k < meaningCount; ++k) {
					const pronunciation = stream.readString();
					const meaning = stream.readString();

					word.meanings.push({
						meaning,
						pronunciation,
						example: null,
						tags: [],
					});
				}
			});
			
			break;
			
		case 1: // EXAMPLE_CONTAINER
			vocabulary.words.forEach((word) => word.meanings.forEach((meaning) => {
				meaning.example = stream.readString();
			}));

			break;
		
		case 2: // TAG_CONTAINER
			const tagCount = stream.readInt();
			for (let j = 0; j < tagCount; ++j) {
				vocabulary.tags.push(stream.readString());
			}

			vocabulary.words.forEach((word) => word.meanings.forEach((meaning) => {
				const meaningTagCount = stream.readInt();
				for (let j = 0; j < meaningTagCount; ++j) {
					meaning.tags.push(stream.readInt());
				}
			}));

			break;
			
		case 3: // RELATION_CONTAINER
			vocabulary.words.forEach((word) => {
				const relationCount = stream.readInt();
				for (let j = 0; j < relationCount; ++j) {
					const wordIndex = stream.readInt();
					const relation = stream.readString();

					word.relations.push({
						word: wordIndex,
						relation,
					});
				}
			});

			break;

		default: // UNKNOWN
			this.offset += containerLength;

			break;
		}
	}

	return vocabulary;
};

module.exports = parseVocabulary;