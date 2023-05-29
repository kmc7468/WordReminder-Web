import "./WordCard.css";

const WordCard = ({ word, isSelected, onClick, deleteWord }) => {
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
		<div className="WordCard" onClick={onClick} style={isSelected ? { backgroundColor: "rgb(160, 160, 160)" } : {}}>
			<h3>{title} <div className="delete" onClick={deleteWord}>ⓧ</div></h3>
			{pronunciation.length !== 0 ? <p className="pronunciation">{`[${ pronunciation }]`}</p> : <></>}

			<p>{meaning}</p>

			{example.length !== 0 ? <p><em>{example}</em></p> : <></>}
			{word.relations.length !== 0 ? <p>{word.relations.map((relation) => <p className="relation"><em>({relation.relation})</em> {relation.word}</p>)}</p> : <></>}
		</div>
	);
};

export default WordCard;