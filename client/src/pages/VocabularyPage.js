import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Navigate, useLocation } from "react-router-dom";

import WordCard from "../components/WordCard";

const VocabularyPage = () => {
	const [meanings, setMeanings] = useState(null);

	const [cookies, setCookies] = useCookies([ "x_auth" ]);
	const { state } = useLocation();

	useEffect(() => {
		if (cookies.x_auth !== undefined && meanings === null) {
			axios.get(`${ process.env.REACT_APP_SERVER }/vocabulary/getMeanings?vocabularyId=${ state.vocabulary.id }`, { withCredentials: true })
				.then((res) => {
					setMeanings(res.data.meanings);
				})
				.catch((err) => {
					window.alert(`단어 목록을 불러오는데 실패했습니다.\n오류 메세지: '${ err }'`);
				});
		} else if (cookies.x_auth === undefined) {
			setMeanings(null);
		}

		return () => {};
	}, [ meanings ]);

	return (
		<div className="VocabularyPage">
			{cookies.x_auth === undefined ? <Navigate to="../login" /> : <></>}
			
			<div className="title">
				<h1>단어장 편집하기</h1>
				<h3>이름: {state.vocabulary.name}</h3>
			</div>

			<div className="words">
				<h2>단어 목록</h2>
				{meanings !== null ? meanings.map((word) => <WordCard word={word} />) : <></>}
			</div>
		</div>
	);
};

export default VocabularyPage;