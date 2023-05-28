import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Navigate, useNavigate } from "react-router-dom";

import "./MainPage.css";
import VocabularyCard from "../components/VocabularyCard";

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

	const logout = () => {
		removeCookies("x_auth");

		movePage("./login");
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
				<button id="createVocabularyButton" onClick={createVocabulary}>빈 단어장 만들기</button>
				<button id="importVocabularyButton" onClick={importVocabulary}>단어장 파일 가져오기</button>
				<button id="logoutButton" onClick={logout}>로그아웃</button>
			</div>

			<div className="vocabularies">
				<h2>단어장 목록</h2>
				{vocabularies !== null ? vocabularies.map((voca) => <VocabularyCard vocabulary={voca} start={() => movePage("./option", { state: { vocabulary: voca } })} edit={editVocabulary(voca)} remove={deleteVocabulary(voca)} />) : <></>}
				{vocabularies !== null && vocabularies.length === 0 ? <p>저장된 단어장이 없습니다.</p> : <></>}
			</div>

			<div className="crossPlatform">
				<h2>크로스 플랫폼</h2>
				<p>WordReminder는 다른 플랫폼에서도 이용할 수 있습니다.</p>
				<ul>
					<li><a href="https://github.com/kmc7468/WordReminder">WordReminder for Windows</a></li>
					<li><a href="https://github.com/kmc7468/WordReminder-Android">WordReminder for Android</a></li>
					<li><a href="https://github.com/kmc7468/WordReminder-Web">WordReminder for Web</a> (현재 이용 중)</li>
				</ul>
			</div>
		</div>
	);
};

export default MainPage;