import axios from "axios";
import { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const [cookies, setCookies] = useCookies([ "x_auth" ]);
	const movePage = useNavigate();

	const login = () => {
		if (username.length === 0) {
			window.alert("아이디를 입력해 주세요.");

			return;
		} else if (password.length === 0) {
			window.alert("비밀번호를 입력해 주세요.");

			return;
		}

		axios.post("http://localhost:8080/account/login", { username, password }, { withCredentials: true })
			.then((res) => {
				movePage("../");
			})
			.catch((err) => {
				window.alert(`로그인에 실패했습니다.\n오류 메세지: '${ err }'`);
			});
	};

	return (
		<div className="LoginPage">
			{cookies.x_auth === undefined ? (<>
				<div className="title">
					<h1>로그인</h1>
					<h3>WordReminder Web을 이용하려면 로그인해야 합니다.</h3>
				</div>

				<div className="login">
					<strong>아이디: </strong>
					<input type="text" id="username" placeholder="아이디..." onChange={e => setUsername(e.target.value)} />
					<br />

					<strong>비밀번호: </strong>
					<input type="password" id="password" placeholder="비밀번호..." onChange={e => setPassword(e.target.value)} />
					<br />

					<button type="button" id="login" onClick={() => login()}>로그인</button>
				</div>

				<div className="register">
					계정이 없으신가요? 지금 <button id="register" onClick={() => movePage("../register")}>회원가입</button> 해보세요.
				</div>
			</>) : (<>
				<div className="title">
					<h1>로그인</h1>
					<h3>이미 WordReminder Web에 로그인되어 있습니다.</h3>
				</div>
			</>)}
		</div>
	);
};

export default LoginPage;