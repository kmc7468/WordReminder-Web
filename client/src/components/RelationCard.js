import "./RelationCard.css";

const RelationCard = ({ relation }) => {
	return (
		<div className="RelationCard">
			<div className="subTitle"><strong>{relation.relation}</strong></div>
			
			{relation.words.map((word) => <div>{word}</div>)}
		</div>
	);
};

export default RelationCard;