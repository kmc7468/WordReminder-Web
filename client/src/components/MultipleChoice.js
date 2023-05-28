const MultipleChoice = ({ question, submit }) => {
	let title;
	let from;
	let choices;

	if (question.type === "w2m") {
		title = "다음 단어의 뜻은?";
		from = question.answer.word.word;
		choices = question.choices.map((choice) => choice.meaning.meaning);
	} else if (question.type === "m2w") {
		title = "다음 뜻을 가진 단어는?";
		from = question.answer.meaning.meaning;
		choices = question.choices.map((choice) => choice.word.word);
	}

	return (
		<div className="MultipleChoice">
			<h1>{title}</h1>
			<h2>제시어: {from}</h2>
			<ol>{choices.map((choice) => <li onClick={e => submit(choices.indexOf(choice))}>{choice}</li>)}</ol>
		</div>
	);
};

export default MultipleChoice;