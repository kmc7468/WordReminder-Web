import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import ImportPage from "./ImportPage";
import MainPage from "./MainPage";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import VocabularyEditor from "./VocabularyEditor";

const App = () => {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<MainPage />}></Route>

					<Route path="login" element={<LoginPage />}></Route>
					<Route path="register" element={<RegisterPage />}></Route>

					<Route path="import" element={<ImportPage />}></Route>
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;