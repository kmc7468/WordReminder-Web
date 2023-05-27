const RelationCard = ({ relation }) => {
	return (
		<div className="relationCard">
			<strong>{relation.relation}</strong>
			{relation.words.map((word) => <p>{word}</p>)}
		</div>
	);
};

export default RelationCard;