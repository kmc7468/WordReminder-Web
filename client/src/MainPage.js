import { useCookies } from "react-cookie";
import { Navigate, useNavigate } from "react-router-dom";

const MainPage = () => {
	const [cookies, setCookies] = useCookies([ "x_auth" ]);
	const movePage = useNavigate();

	return (
		<div className="MainPage">
			{cookies.x_auth === undefined ? <Navigate to="./login" /> : <></>}

			<div className="title">
				<h1>WordReminder</h1>
				<h3>단어 암기 애플리케이션</h3>
			</div>
		</div>
	);
};

export default MainPage;