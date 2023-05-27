import "./MeaningCard.css";

const MeaningCard = ({ meaning, deleteMeaning }) => {
	const tag = meaning.tags
		.map((tag) => `#${ tag }`)
		.join(" ");

	return (
		<div className="meaningCard">
			<strong>{meaning.meaning} <p className="delete" onClick={deleteMeaning}>ⓧ</p></strong>
			
			{meaning.pronunciation !== null ? <p>{`[${ meaning.pronunciation }]`}</p> : <></>}
			{meaning.example !== null ? <p>예문: {meaning.example}</p> : <></>}
			{tag.length !== 0 ? <p>{tag}</p> : <></>}
		</div>
	);
};

export default MeaningCard;