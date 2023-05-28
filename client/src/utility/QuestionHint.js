const generateHint = (question, choice) => {
	const hint = [];

	if (question.hint.pronunciation && choice.meaning.pronunciation) {
		hint.push({ type: "발음", hint: choice.meaning.pronunciation });
	}
	if (question.hint.example && choice.meaning.example) {
		hint.push({ type: "예문", hint: choice.meaning.example });
	}

	return hint;
};

const generateHintTag = (hint) => {
	return <p><strong>{hint.type}:</strong> {hint.hint}</p>
};

export { generateHint, generateHintTag };