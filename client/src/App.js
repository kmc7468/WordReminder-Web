import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import ImportPage from "./pages/ImportPage";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import OptionPage from "./pages/OptionPage";
import QuestionPage from "./pages/QuestionPage";
import RegisterPage from "./pages/RegisterPage";
import VocabularyPage from "./pages/VocabularyPage";

const App = () => {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<MainPage />} />

					<Route path="login" element={<LoginPage />} />
					<Route path="register" element={<RegisterPage />} />

					<Route path="import" element={<ImportPage />} />
					<Route path="vocabulary" element={<VocabularyPage />} />
					<Route path="option" element={<OptionPage />} />
					<Route path="question" element={<QuestionPage />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;