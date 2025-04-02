import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function TestCreator() {
    const [testTitle, setTestTitle] = useState("");
    const [questions, setQuestions] = useState([]);

    const addQuestion = () => {
        setQuestions([
            ...questions,
            {
                text: "",
                options: ["", "", "", ""],
                correct: [],
                topicNumber: 1,
                isMultipleChoice: false,
                optionCount: 4,
                isNumeric: false,
            },
        ]);
    };

    const updateQuestion = (index, newText) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].text = newText;
        setQuestions(updatedQuestions);
    };

    const updateOption = (qIndex, oIndex, newText) => {
        const updatedQuestions = [...questions];
        if (updatedQuestions[qIndex].isNumeric) {
            // Удаляем все символы, кроме цифр, точки и знака минус
            newText = newText.replace(/[^0-9.-]/g, '');
        }
        updatedQuestions[qIndex].options[oIndex] = newText;
        setQuestions(updatedQuestions);
    };

    const toggleCorrectOption = (qIndex, oIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].correct = updatedQuestions[qIndex].correct || [];
        const correctAnswers = updatedQuestions[qIndex].correct;

        if (updatedQuestions[qIndex].isMultipleChoice) {
            if (correctAnswers.includes(oIndex)) {
                updatedQuestions[qIndex].correct = correctAnswers.filter(i => i !== oIndex);
            } else {
                updatedQuestions[qIndex].correct = [...correctAnswers, oIndex];
            }
        } else {
            updatedQuestions[qIndex].correct = [oIndex];
        }

        setQuestions(updatedQuestions);
    };

    const updateTopicNumber = (qIndex, newNumber) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].topicNumber = Math.max(1, parseInt(newNumber) || 1);
        setQuestions(updatedQuestions);
    };

    const toggleQuestionType = (qIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].isMultipleChoice = !updatedQuestions[qIndex].isMultipleChoice;
        if (!updatedQuestions[qIndex].isMultipleChoice) {
            updatedQuestions[qIndex].correct = updatedQuestions[qIndex].correct.slice(0, 1);
        }
        setQuestions(updatedQuestions);
    };

    const toggleAnswerType = (qIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[qIndex].isNumeric = !updatedQuestions[qIndex].isNumeric;
        updatedQuestions[qIndex].options = updatedQuestions[qIndex].options.map(opt =>
            updatedQuestions[qIndex].isNumeric ? "" : opt
        );
        setQuestions(updatedQuestions);
    };

    const updateOptionCount = (qIndex, change) => {
        const updatedQuestions = [...questions];
        const newCount = Math.max(1, updatedQuestions[qIndex].optionCount + change);
        updatedQuestions[qIndex].optionCount = newCount;
        updatedQuestions[qIndex].options = Array(newCount)
            .fill("")
            .map((_, i) => updatedQuestions[qIndex].options[i] || "");
        setQuestions(updatedQuestions);
    };

    const handleSubmit = async () => {
        const testData = { title: testTitle, questions };
        console.log("Отправка данных: ", testData);

        try {
            const response = await fetch("https://your-api-endpoint.com/tests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(testData),
            });
            if (!response.ok) throw new Error("Ошибка отправки теста");
            alert("Тест успешно отправлен!");
        } catch (error) {
            console.error("Ошибка при отправке теста:", error);
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Конструктор тестов</h1>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Название теста"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
            />
            <button className="btn btn-primary mb-3" onClick={addQuestion}>
                Добавить вопрос
            </button>
            {questions.map((q, qIndex) => (
                <div key={qIndex} className="card p-3 mb-3">
          <textarea
              className="form-control mb-2"
              placeholder="Введите текст вопроса"
              value={q.text}
              onChange={(e) => updateQuestion(qIndex, e.target.value)}
          />
                    <input
                        type="number"
                        className="form-control mb-2"
                        min="1"
                        value={q.topicNumber}
                        onChange={(e) => updateTopicNumber(qIndex, e.target.value)}
                        placeholder="Номер темы"
                    />
                    <div className="form-check form-switch mb-2">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={q.isMultipleChoice}
                            onChange={() => toggleQuestionType(qIndex)}
                        />
                        <label className="form-check-label">Несколько правильных ответов</label>
                    </div>
                    <div className="form-check form-switch mb-2">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            checked={q.isNumeric}
                            onChange={() => toggleAnswerType(qIndex)}
                        />
                        <label className="form-check-label">Ответы числовые</label>
                    </div>
                    <div className="mb-2">
                        <label className="form-label">Количество вариантов ответа:</label>
                        <div className="d-flex">
                            <button className="btn btn-secondary me-2" onClick={() => updateOptionCount(qIndex, -1)}>-</button>
                            <span className="align-self-center">{q.optionCount}</span>
                            <button className="btn btn-secondary ms-2" onClick={() => updateOptionCount(qIndex, 1)}>+</button>
                        </div>
                    </div>
                    {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="form-check">
                            <input
                                className="form-check-input"
                                type={q.isMultipleChoice ? "checkbox" : "radio"}
                                name={`question-${qIndex}`}
                                checked={(q.correct || []).includes(oIndex)}
                                onChange={() => toggleCorrectOption(qIndex, oIndex)}
                            />
                            <input
                                type={q.isNumeric ? "number" : "text"}
                                className="form-control d-inline-block w-75 ms-2"
                                placeholder={`Вариант ${oIndex + 1}`}
                                value={opt}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                onKeyPress={
                                    q.isNumeric
                                        ? (e) => {
                                            if (!/[0-9.-]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }
                                        : undefined
                                }
                            />
                        </div>
                    ))}
                </div>
            ))}
            <button className="btn btn-success" onClick={handleSubmit}>
                Отправить тест
            </button>
        </div>
    );
}

export default TestCreator;
