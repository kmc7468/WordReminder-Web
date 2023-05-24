import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Main from "./Main";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import VocabularyEditor from "./VocabularyEditor";

const App = () => {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={ <Main /> }></Route>
					<Route path="vocabularyEditor" element={ <VocabularyEditor /> }></Route>
					<Route path="login" element={ <LoginPage /> }></Route>
					<Route path="register" element={ <RegisterPage /> }></Route>
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;