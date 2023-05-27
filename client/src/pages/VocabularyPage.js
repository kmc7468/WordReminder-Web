import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Navigate, useLocation } from "react-router-dom";

import "./VocabularyPage.css";
import MeaningCard from "../components/MeaningCard";
import RelationCard from "../components/RelationCard";
import WordCard from "../components/WordCard";

const VocabularyPage = () => {
	const [meanings, setMeanings] = useState(null);
	const [selectedWord, setSelectedWord] = useState(-1);

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
	}, [ selectedWord, meanings ]);

	const deleteWord = (word) => () => {
		axios.post(`${ process.env.REACT_APP_SERVER }/vocabulary/removeMeaning`, { vocabularyId: state.vocabulary.id, word: word.word, meaning: "*" }, { withCredentials: true })
			.then((res) => {
				const newWordCount = meanings.length - 1;
				if (selectedWord >= newWordCount) {
					setSelectedWord(newWordCount - 1);
				}
				
				setMeanings(meanings.filter((w) => w.word !== word.word));
			})
			.catch((err) => {
				window.alert(`단어를 삭제하지 못했습니다.\n오류 메세지: '${ err }'`)
			});
	};

	const deleteMeaning = (meaning) => () => {
		const word = meanings[selectedWord];

		if (word.meanings.length === 1) {
			if (!window.confirm("이 뜻을 삭제하면 단어가 삭제됩니다. 그래도 삭제할까요?")) return;

			deleteWord(word)();
		} else {
			axios.post(`${ process.env.REACT_APP_SERVER }/vocabulary/removeMeaning`, { vocabularyId: state.vocabulary.id, word: word.word, meaning: meaning.meaning }, { withCredentials: true })
				.then((res) => {
					setMeanings(meanings.map((w) => w !== word ? w : {
						word: w.word,
						meanings: w.meanings.filter((m) => m != meaning),
						relations: w.relations,
					}));
				})
				.catch((err) => {
					window.alert(`뜻을 삭제하지 못했습니다.\n오류 메세지: '${ err }'`)
				});
		}
	};

	const categorizeRelations = (relations) => {
		return relations
			.map((relation) => relation.relation)
			.reduce((a, c) => a.includes(c) ? a : [...a, c], []) // 중복 제거
			.map((relation) => {
				return {
					relation,
					words: relations
						.filter((rel) => rel.relation === relation)
						.map((rel) => rel.word),
				};
			});
	};

	return (
		<div className="VocabularyPage">
			{cookies.x_auth === undefined ? <Navigate to="../login" /> : <></>}
			
			<div className="title">
				<h1>단어장 편집하기</h1>
				<h3>이름: {state.vocabulary.name}</h3>
			</div>

			<div className="words">
				<h2>단어 목록</h2>
				<div className="content">
					{meanings !== null ? meanings.map((word) => <WordCard word={word} onClick={e => setSelectedWord(meanings.indexOf(word))} deleteWord={deleteWord(word)} />) : <></>}
				</div>
			</div>

			<div className="word">
				<h2>세부 정보</h2>
				<div className="content">
					<h3>뜻 목록</h3>
					{selectedWord !== -1 ? meanings[selectedWord].meanings.map((meaning) => <MeaningCard meaning={meaning} deleteMeaning={deleteMeaning(meaning)} />) : <></>}
					
					<h3>관계 목록</h3>
					{selectedWord !== -1 ? categorizeRelations(meanings[selectedWord].relations).map((relation) => <RelationCard relation={relation} />) : <></>}
				</div>
			</div>
		</div>
	);
};

export default VocabularyPage;