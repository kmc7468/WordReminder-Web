import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import ImportPage from "./pages/ImportPage";
import MainPage from "./pages/MainPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VocabularyPage from "./pages/VocabularyPage";

const App = () => {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<MainPage />}></Route>

					<Route path="login" element={<LoginPage />}></Route>
					<Route path="register" element={<RegisterPage />}></Route>

					<Route path="import" element={<ImportPage />}></Route>
					<Route path="vocabulary" element={<VocabularyPage />}></Route>
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;