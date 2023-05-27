import "./WordCard.css";

const WordCard = ({ word, onClick }) => {
	const title = word.word;
	const pronunciation = word.meanings
		.map((meaning) => meaning.pronunciation)
		.filter((pronunciation) => pronunciation !== null) // 빈 값 제거
		.reduce((a, c) => a.includes(c) ? a : [...a, c], []) // 중복 제거
		.join(", ");
	const meaning = word.meanings
		.map((meaning) => meaning.meaning)
		.join(", ");
	const example = word.meanings
		.map((meaning) => meaning.example)
		.filter((example) => example !== null) // 빈 값 제거
		.reduce((a, c) => a.includes(c) ? a : [...a, c], []) // 중복 제거
		.join(", ");

	return (
		<div className="wordCard" onClick={onClick}>
			<h3>{title}</h3>
			{pronunciation.length !== 0 ? <p>{`[${ pronunciation }]`}</p> : <></>}

			<p>{meaning}</p>

			{example.length !== 0 ? <em>{example}</em> : <></>}
			{word.relations.length !== 0 ? word.relations.map((relation) => <p><em>({relation.relation})</em> {relation.word}</p>) : <></>}
		</div>
	);
};

export default WordCard;