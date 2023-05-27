import axios from "axios";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const [cookies, setCookies] = useCookies([ "x_auth" ]);
	const movePage = useNavigate();

	const register = () => {
		if (username.length === 0) {
			window.alert("아이디를 입력해 주세요.");

			return;
		} else if (password.length === 0) {
			window.alert("비밀번호를 입력해 주세요.");

			return;
		}

		axios.post(`${ process.env.REACT_APP_SERVER }/account/register`, { username, password })
			.then((res) => {
				window.alert("회원가입에 성공했습니다. 가입한 계정으로 로그인해 주세요.");

				movePage("../login");
			})
			.catch((err) => {
				window.alert(`회원가입에 실패했습니다.\n오류 메세지: '${ err }'`);
			});
	};

	return (
		<div className="RegisterPage">
			{cookies.x_auth === undefined ? (<>
				<div className="title">
				<h1>회원가입</h1>
				<h3>회원가입 후 WordReminder Web의 모든 기능을 무료로 이용할 수 있습니다.</h3>
				<h3>주의사항: 다른 사이트에서 사용한 비밀번호를 여기에서 사용하지 마세요.</h3>
				<p>HTTPS가 아직 적용되지 않았기 때문에, 비밀번호를 서버로 전송할 때 암호화되지 않고 평문으로 전송됩니다. (서버에서는 암호화하여 안전하게 보관합니다.)</p>
			</div>

			<div className="register">
				<strong>아이디: </strong>
				<input type="text" id="username" placeholder="아이디..." onChange={e => setUsername(e.target.value)} />
				<br />

				<strong>비밀번호: </strong>
				<input type="password" id="password" placeholder="비밀번호..." onChange={e => setPassword(e.target.value)} />
				<br />

				<button type="button" id="register" onClick={register}>회원가입</button>
			</div>
			</>) : (<>
				<div className="title">
					<h1>회원가입</h1>
					<h3>이미 WordReminder Web에 로그인되어 있습니다.</h3>
				</div>
			</>)}
		</div>
	);
};

export default RegisterPage;