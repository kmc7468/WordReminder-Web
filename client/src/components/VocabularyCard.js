import axios from "axios";
import { useEffect, useState } from "react";

import "./VocabularyCard.css";

const VocabularyCard = ({ vocabulary, start, edit, remove }) => {
	const [wordCount, setWordCount] = useState(-1);

	useEffect(() => {
		if (wordCount === -1) {
			axios.get(`${ process.env.REACT_APP_SERVER }/vocabulary/getMeanings?vocabularyId=${ vocabulary.id }`, { withCredentials: true })
				.then((res) => {
					setWordCount(res.data.meanings.length);
				})
				.catch((err) => {
					window.alert(`단어장을 불러오는데 실패했습니다.\n오류 메세지: '${ err }'`);
				});
		}

		return () => {};
	}, [ wordCount ]);
	
	return (
		<div className="VocabularyCard">
			<h3>{vocabulary.name}</h3>
			<p><strong>단어 개수: </strong>{wordCount}개</p>

			<div className="tools">
				<button id="startButton" onClick={start}>암기하기</button>
				<button id="editButton" onClick={edit}>편집하기</button>
				<button id="deleteButton" onClick={remove}>삭제하기</button>
			</div>
		</div>
	);
};

export default VocabularyCard;