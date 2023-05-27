import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Navigate, useNavigate } from "react-router-dom";

import "./MainPage.css";

const MainPage = () => {
	const [vocabularies, setVocabularies] = useState(null);

	const [cookies, setCookies, removeCookies] = useCookies([ "x_auth" ]);
	const movePage = useNavigate();

	useEffect(() => {
		if (cookies.x_auth !== undefined && vocabularies === null) {
			axios.get(`${ process.env.REACT_APP_SERVER }/vocabulary/getVocabularies`, { withCredentials: true })
				.then((res) => {
					setVocabularies(res.data.vocabularies);
				})
				.catch((err) => {
					window.alert(`단어장 목록을 불러오는데 실패했습니다.\n오류 메세지: '${ err }'`);
				});
		} else if (cookies.x_auth === undefined) {
			setVocabularies(null);
		}

		return () => {};
	}, [ vocabularies ]);

	const logout = () => {
		removeCookies("x_auth");

		movePage("./login");
	};

	const createVocabulary = () => {
		const name = window.prompt("단어장 이름:");
		if (!name) return;

		axios.post(`${ process.env.REACT_APP_SERVER }/vocabulary/createVocabulary`, { vocabularyName: name }, { withCredentials: true })
			.then((res) => {
				setVocabularies(vocabularies.concat([{
					name,
					id: res.data.id,
				}]));

				movePage("./vocabulary", { state: {
					vocabulary: {
						name,
						id: res.data.id
					} } });
			})
			.catch((err) => {
				window.alert(`단어장을 만들지 못했습니다.\n오류 메세지: '${ err }'`)
			});
	};

	const importVocabulary = () => {
		movePage("./import");
	};

	const editVocabulary = (vocabulary) => () => {
		movePage("./vocabulary", { state: { vocabulary } });
	};

	const deleteVocabulary = (vocabulary) => () => {
		if (!window.confirm("단어장을 삭제할까요? 작업은 되돌릴 수 없습니다.\n")) return;

		axios.post(`${ process.env.REACT_APP_SERVER }/vocabulary/deleteVocabulary`, { vocabularyId: vocabulary.id }, { withCredentials: true })
			.then((res) => {
				setVocabularies(vocabularies.filter((voca) => voca.id !== vocabulary.id));
			})
			.catch((err) => {
				window.alert(`단어장을 삭제하지 못했습니다.\n오류 메세지: '${ err }'`)
			});
	};

	return (
		<div className="MainPage">
			{cookies.x_auth === undefined ? <Navigate to="./login" /> : <></>}

			<div className="title">
				<h1>WordReminder</h1>
				<h3>단어 암기 애플리케이션</h3>
			</div>

			<div className="tools">
				<button id="logout" onClick={logout}>로그아웃</button>
				<button id="createVocabulary" onClick={createVocabulary}>단어장 만들기</button>
				<button id="importVocabulary" onClick={importVocabulary}>단어장 파일 가져오기</button>
			</div>

			<div className="vocabularies">
				<h3>단어장 목록</h3>
				<ul>{vocabularies !== null ? vocabularies.map((voca) => <li><p onClick={editVocabulary(voca)}>{voca.name}</p> <p className="delete" onClick={deleteVocabulary(voca)}>ⓧ</p></li>) : <></>}</ul>
			</div>
		</div>
	);
};

export default MainPage;