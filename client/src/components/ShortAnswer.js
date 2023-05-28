import { useState } from "react";

import { generateHint, generateHintTag } from "../utility/QuestionHint";

const ShortAnswer = ({ question, submit }) => {
	const [answer, setAnswer] = useState("");

	let title;
	let from;
	let hint = generateHint(question, question.answer);

	if (question.type === "w2ms") {
		title = "다음 단어의 뜻은?";
		from = question.answer.word.word;
	} else if (question.type === "m2ws") {
		title = "다음 뜻을 가진 단어는?";
		from = question.answer.meaning.meaning;
	}

	return (
		<div className="ShortAnswer">
			<h1>{title}</h1>
			<h2>제시어: {from}</h2>
			{hint.map((hint) => generateHintTag(hint))}

			<input type="text" id="answer" placeholder="답안 입력..." onChange={e => setAnswer(e.target.value)} />
			<button type="button" id="submit" onClick={() => submit(answer)}>제출</button>
		
			<p><strong>주의사항:</strong> 대소문자 및 띄어쓰기에 유의하세요.</p>
		</div>
	);
};

export default ShortAnswer;