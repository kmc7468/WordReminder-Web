import { generateHint, generateHintTag } from "../utility/QuestionHint";

const MultipleChoice = ({ question, submit }) => {
	let title;
	let from, fromHint = [];
	let choices;

	if (question.type === "w2m") {
		title = "다음 단어의 뜻은?";
		from = question.answer.word.word;
		fromHint = generateHint(question, question.answer);
		choices = question.choices.map((choice) => {
			return {
				choice: choice.meaning.meaning,
				hint: [],
			};
		});
	} else if (question.type === "m2w") {
		title = "다음 뜻을 가진 단어는?";
		from = question.answer.meaning.meaning;
		choices = question.choices.map((choice) => {
			return {
				choice: choice.word.word,
				hint: generateHint(question, choice),
			}
		});
	}

	return (
		<div className="MultipleChoice">
			<h1>{title}</h1>
			<h2>제시어: {from}</h2>
			{fromHint.map((hint) => generateHintTag(hint))}
			<ol>{choices.map((choice) => <li onClick={e => submit(choices.indexOf(choice))}><p>{choice.choice}</p>{choice.hint.map((hint) => generateHintTag(hint))}</li>)}</ol>
		</div>
	);
};

export default MultipleChoice;