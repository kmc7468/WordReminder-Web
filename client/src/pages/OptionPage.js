import { useState } from "react";
import { useCookies } from "react-cookie";
import { Navigate, useNavigate, useLocation } from "react-router-dom";

const OptionPage = () => {
	const [w2m, setW2M] = useState(false);
	const [w2ms, setW2MS] = useState(false);
	const [m2w, setM2W] = useState(false);
	const [m2ws, setM2WS] = useState(false);
	const [hintPronunciation, setHintPronunciation] = useState(false);
	const [hintExample, setHintExample] = useState(false);

	const [cookies, setCookies] = useCookies([ "x_auth" ]);
	const movePage = useNavigate();
	const { state } = useLocation();

	const start = () => {
		if (!w2m && !w2ms && !m2w && !m2ws) {
			window.alert("문제 유형을 1개 이상 선택해 주세요.");

			return;
		}

		movePage("../question", { state: {
			vocabulary: state.vocabulary,
			questionType: { w2m, w2ms, m2w, m2ws },
			questionHint: {
				pronunciation: hintPronunciation,
				example: hintExample,
			},
		} });
	};

	return (
		<div className="OptionPage">
			{cookies.x_auth === undefined ? <Navigate to="../login" /> : <></>}

			<div className="title">
				<h1>단어 암기하기</h1>
				<h3>문제 생성을 위해 옵션을 설정해 주세요.</h3>
			</div>

			<div className="type">
				<h3>문제 유형</h3>
				<p>1개 이상 선택해야 합니다.</p>

				<input type="checkbox" name="type" id="typeW2M" value="w2m" onChange={e => setW2M(e.target.checked)} />
				<label htmlFor="typeW2M">단어 보고 뜻 맞히기 (선택형)</label>
				<br />

				<input type="checkbox" name="type" id="typeW2MS" value="w2ms" onChange={e => setW2MS(e.target.checked)} />
				<label htmlFor="typeW2MS">단어 보고 뜻 맞히기 (단답형)</label>
				<br />

				<input type="checkbox" name="type" id="typeM2W" value="m2w" onChange={e => setM2W(e.target.checked)} />
				<label htmlFor="typeM2W">뜻 보고 단어 맞히기 (선택형)</label>
				<br />

				<input type="checkbox" name="type" id="typeM2WS" value="m2ws" onChange={e => setM2WS(e.target.checked)} />
				<label htmlFor="typeM2WS">뜻 보고 단어 맞히기 (단답형)</label>

				<p><strong>주의사항:</strong> 선택형의 경우 동음이의어/다의어를 제외하고 5개 이상의 단어가 단어장에 등록되어 있어야 정상적으로 동작합니다. (Web 버전에는 검사 알고리즘이 아직 없어 오류가 발생할 수 있습니다.)</p>
			</div>

			<div className="hint">
				<h3>문제 힌트</h3>
				<p>힌트가 단어장에 등록되어 있는 경우에만 표시됩니다.</p>

				<input type="checkbox" name="hint" id="hintPronunciation" value="pronunciation" onChange={e => setHintPronunciation(e.target.checked)} />
				<label htmlFor="hintPronunciation">발음 표시하기</label>
				<br />

				<input type="checkbox" name="hint" id="hintExample" value="example" onChange={e => setHintExample(e.target.checked)} />
				<label htmlFor="hintExample">예문 표시하기</label>
				<br />
			</div>

			<button id="start" onClick={start}>시작하기</button>
		</div>
	);
};

export default OptionPage;