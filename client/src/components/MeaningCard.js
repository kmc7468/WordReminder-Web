import "./MeaningCard.css";

const MeaningCard = ({ meaning, deleteMeaning }) => {
	const tag = meaning.tags
		.map((tag) => `#${ tag }`)
		.join(" ");

	return (
		<div className="MeaningCard">
			<strong>{meaning.meaning} <div className="delete" onClick={deleteMeaning}>ⓧ</div></strong>
			{meaning.pronunciation !== null ? <p className="pronunciation">{`[${ meaning.pronunciation }]`}</p> : <></>}

			{meaning.example !== null ? <p>예문: {meaning.example}</p> : <></>}
			{tag.length !== 0 ? <p>{tag}</p> : <></>}
		</div>
	);
};

export default MeaningCard;