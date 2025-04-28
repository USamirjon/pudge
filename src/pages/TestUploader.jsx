import React, { useRef, useState } from 'react';
import mammoth from 'mammoth';

const TestUploader = ({ blockIndex, onQuestionsImported }) => {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Function to parse the test questions from text content
    const parseTestQuestions = (textContent) => {
        // Split the content by "Вопрос" to separate individual questions
        const questionBlocks = textContent.split(/\*\*Вопрос \d+\.?\*\*|\*\*Вопрос \d+:\*\*/);

        // Remove the first element if it's empty (usually happens from the split)
        if (questionBlocks[0].trim() === '') {
            questionBlocks.shift();
        }

        // Parse each question block
        const questions = questionBlocks.map((block, index) => {
            if (!block.trim()) return null;

            // Extract the question text (everything before the first option)
            const questionText = block.split(/[a-c]\)/)[0].trim();

            // Extract options
            const optionsPattern = /([a-c])\)(.*?)(?=\n[a-c]\)|\nПравильный ответ|$)/gs;
            const optionsMatches = [...block.matchAll(optionsPattern)];

            const answers = optionsMatches.map(match => {
                const optionLetter = match[1].toLowerCase();
                const optionText = match[2].trim();
                return {
                    title: optionText,
                    isCorrect: false, // Will be set later
                    explanation: ''
                };
            });

            // Find the correct answer
            const correctAnswerMatch = block.match(/Правильный ответ:?\s*([a-c])/i);
            if (correctAnswerMatch) {
                const correctLetter = correctAnswerMatch[1].toLowerCase();
                // Set the correct answer
                const correctIndex = correctLetter.charCodeAt(0) - 'a'.charCodeAt(0);
                if (answers[correctIndex]) {
                    answers[correctIndex].isCorrect = true;
                }
            }

            return {
                title: questionText,
                explanation: '',
                answers: answers
            };
        }).filter(Boolean); // Remove null entries

        return questions;
    };

    // Handle DOCX file upload
    const handleDocxUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        const reader = new FileReader();
        reader.onload = (event) => {
            const arrayBuffer = event.target.result;

            mammoth.extractRawText({ arrayBuffer })
                .then((result) => {
                    const text = result.value;
                    try {
                        const questions = parseTestQuestions(text);
                        if (questions.length === 0) {
                            throw new Error('Не удалось найти вопросы в документе');
                        }
                        onQuestionsImported(blockIndex, questions);
                    } catch (err) {
                        console.error('Ошибка при разборе вопросов:', err);
                        setError('Не удалось разобрать вопросы из документа: ' + err.message);
                    }
                })
                .catch((err) => {
                    console.error('Ошибка при чтении документа:', err);
                    setError('Произошла ошибка при чтении документа: ' + err.message);
                })
                .finally(() => {
                    setLoading(false);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                });
        };

        reader.onerror = () => {
            setError('Ошибка при чтении файла');
            setLoading(false);
        };

        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="test-uploader">
            <div className="btn-group mb-2">
                <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => fileInputRef.current.click()}
                    disabled={loading}
                >
                    {loading ? 'Загрузка...' : 'Импорт теста из DOCX'}
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx"
                    style={{ display: 'none' }}
                    onChange={handleDocxUpload}
                    disabled={loading}
                />
            </div>

            {error && (
                <div className="alert alert-danger mt-2" role="alert">
                    {error}
                </div>
            )}
        </div>
    );
};

export default TestUploader;