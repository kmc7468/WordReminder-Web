import axios from "axios";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { Navigate, useNavigate } from "react-router-dom";

const ImportPage = () => {
	const [name, setName] = useState("");
	const [file, setFile] = useState(null);

	const [cookies, setCookies] = useCookies([ "x_auth" ]);
	const movePage = useNavigate();

	const upload = () => {
		if (name.length === 0) {
			window.alert("단어장 이름을 입력해 주세요.");

			return;
		} else if (file === null) {
			window.alert("단어장 파일을 선택해 주세요.");

			return;
		}

		const formData = new FormData();

		formData.append("vocabularyName", name);
		formData.append("file", file);

		axios.post(`${ process.env.REACT_APP_SERVER }/vocabulary/uploadVocabulary`, formData, {
			withCredentials: true,
			headers: {
				"Content-Type": "multipart/form-data",
			}})
			.then((res) => {
				movePage("../vocabulary", { state: {
					vocabulary: {
						name,
						id: res.data.id
					} } });
			})
			.catch((err) => {
				window.alert(`단어장을 가져오는데 실패했습니다.\n오류 메세지: '${ err }'`);
			});
	};

	return (
		<div className="ImportPage">
			{cookies.x_auth === undefined ? <Navigate to="./login" /> : <></>}

			<div className="title">
				<h1>단어장 파일 가져오기</h1>
				<h3>Windows/Android용 WordReminder에서 사용하던 *.kwl 또는 *.kv 확장자의 단어장 파일을 가져와 Web에서도 사용할 수 있습니다.</h3>
			</div>

			<div className="import">
				<strong>단어장 이름: </strong>
				<input type="text" id="name" placeholder="단어장 이름..." onChange={e => setName(e.target.value)} />
				<br />

				<strong>단어장 파일: </strong>
				<input type="file" id="vocabulary" onChange={e => setFile(e.target.files[0])} />
				<br />

				<button type="button" id="upload" onClick={upload}>가져오기</button>
			</div>

			<div className="samples">
				<h2>샘플 단어장 파일 다운로드</h2>
				<strong>외부 반출을 금합니다.</strong>

				<form action={`${ process.env.REACT_APP_SERVER }/static/WordMaster.kv`} method="GET">
					<button type="submit">WordMaster.kv (11kiB)</button>
				</form>

				<form action={`${ process.env.REACT_APP_SERVER }/static/EBS.kv`} method="GET">
					<button type="submit">EBS.kv (209kiB)</button>
				</form>

				<form action={`${ process.env.REACT_APP_SERVER }/static/Hanja.kv`} method="GET">
					<button type="submit">Hanja.kv (1kiB)</button>
				</form>
			</div>
		</div>
	);
};

export default ImportPage;