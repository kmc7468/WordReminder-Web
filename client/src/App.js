import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Main from "./Main";
import VocabularyEditor from "./VocabularyEditor";

const App = () => {
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={ <Main /> }></Route>
					<Route path="vocabularyEditor" element={ <VocabularyEditor /> }></Route>
				</Routes>
			</BrowserRouter>
		</div>
	);
};

export default App;