import axios from "axios";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Navigate, useLocation } from "react-router-dom";

import { randInt, randElement } from "../utility/Random";
import MultipleChoice from "../components/MultipleChoice";
import ShortAnswer from "../components/ShortAnswer";

const QuestionPage = () => {
	const [meanings, setMeanings] = useState(null);
	const [question, setQuestion] = useState(null);

	const [cookies, setCookies] = useCookies([ "x_auth" ]);
	const { state } = useLocation();

	const generateQuestion = () => {
		const usableTypes = Object.keys(state.questionType)
			.filter((type) => state.questionType[type]);
		const type = randElement(usableTypes);
		const isMultipleChoice = type === "w2m" || type === "m2w";

		const randMeaning = () => {
			const randWord = randElement(meanings);
			const randMeaning = randElement(randWord.meanings);

			return { word: randWord, meaning: randMeaning };
		};
		const answer = randMeaning();

		const hint = {
			pronunciation: state.questionHint.pronunciation,
			example: state.questionHint.example
		};

		if (isMultipleChoice) {
			const choices = [ answer ];

			for (let i = 1; i < 5; ++i) { // 선택지 생성
				let limit = 100;
				let success = false;

				while (limit --> 0) { // 100번 횟수 제한 (단어 부족한 경우 핸들링한 것임)
					const choice = randMeaning();
					let unique = true;
					
					for (let j = 0; j < i; ++j) {
						if (choices[j].word === choice.word ||
							choices[j].meaning.meaning === choice.meaning.meaning ||
							choices[j].word.meanings.find((meaning) => meaning.meaning === choice.meaning.meaning) !== undefined) {
							unique = false;

							break;
						}
					}

					if (unique) {
						choices.push(choice);

						success = true;
						break;
					}
				}

				if (!success) throw Error("문제를 생성하지 못했습니다.");
			}

			const answerIndex = randInt(0, 4);

			choices[0] = choices[answerIndex];
			choices[answerIndex] = answer;

			return { type, isMultipleChoice, answer, answerIndex, choices, hint };
		} else return { type, isMultipleChoice, answer, hint };
	};

	useEffect(() => {
		if (cookies.x_auth !== undefined && meanings === null) {
			axios.get(`${ process.env.REACT_APP_SERVER }/vocabulary/getMeanings?vocabularyId=${ state.vocabulary.id }`, { withCredentials: true })
				.then((res) => {
					setMeanings(res.data.meanings);
				})
				.catch((err) => {
					window.alert(`단어 목록을 불러오는데 실패했습니다.\n오류 메세지: '${ err }'`);
				});
		} else if (cookies.x_auth === undefined) {
			setMeanings(null);
		}

		if (question === null && meanings !== null) {
			setQuestion(generateQuestion());
		}

		return () => {};
	}, [ meanings, question ]);

	const submit = (userChoice) => {
		if (question.isMultipleChoice) {
			if (userChoice === question.answerIndex) {
				setQuestion(generateQuestion());				
			} else {
				window.alert("오답입니다. 다시 도전해 보세요.");
			}
		} else {
			if (question.type === "w2ms") {
				if (question.answer.word.meanings.find((meaning) => meaning.meaning === userChoice)) {
					setQuestion(generateQuestion());	
				} else {
					window.alert("오답입니다. 다시 도전해 보세요.");
				}
			} else if (question.type === "m2ws") {
				const word = meanings.find((word) => word.word === userChoice);
				if (word && word.meanings.find((meaning) => meaning.meaning === question.answer.meaning.meaning)) {
					setQuestion(generateQuestion());
				} else {
					window.alert("오답입니다. 다시 도전해 보세요.");
				}
			}
		}
	};

	const skip = () => {
		window.alert(`정답은 ${ question.answer.word.word }(${ question.answer.meaning.meaning })입니다.`);
		
		setQuestion(generateQuestion());
	};

	return (
		<div className="QuestionPage">
			{cookies.x_auth === undefined ? <Navigate to="../login" /> : <></>}

			{question !== null && question.isMultipleChoice ? <MultipleChoice question={question} submit={submit} /> : <></>}
			{question !== null && !question.isMultipleChoice ? <ShortAnswer question={question} submit={submit} /> : <></>}

			<button id="skip" onClick={skip}>스킵</button>
		</div>
	);
};

export default QuestionPage;