import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import * as mammoth from 'mammoth';

function BlockContentUploader({ show, handleClose, blockIndex, onUploadComplete }) {
    const [files, setFiles] = useState({ lessons: null, test: null });
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (type) => (e) => {
        setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
        setError('');
    };

    const extractTextFromDocx = async (file) => {
        if (!file) return null;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const { value } = await mammoth.extractRawText({ arrayBuffer });

            // Разделение текста на абзацы, чтобы сохранить форматирование
            const paragraphs = value.split('\n').map(paragraph => paragraph.trim()).filter(paragraph => paragraph !== '');
            return paragraphs.join('\n\n'); // Разделение абзацев двойным переносом строки
        } catch (err) {
            throw new Error(`Ошибка обработки файла ${file.name}: убедитесь, что это корректный .docx файл.`);
        }
    };

    const parseLessonsText = (text) => {
        if (!text) return [];
        return text.split('===').map(block => {
            const trimmedBlock = block.trim();
            if (!trimmedBlock) return null;

            const title = trimmedBlock.match(/^Название:\s*(.+)/im)?.[1]?.trim() || '';
            const briefDescription = trimmedBlock.match(/^Краткое описание:\s*(.+)/im)?.[1]?.trim() || '';
            const description = trimmedBlock.match(/^Описание:\s*([\s\S]+?)(?=^Видео:|^Опыт:|$)/im)?.[1]?.trim() || '';
            const urlVideo = trimmedBlock.match(/^Видео:\s*(.+)/im)?.[1]?.trim() || '';
            const experience = parseInt(trimmedBlock.match(/^Опыт:\s*(\d+)/im)?.[1] || '0', 10);

            return { title, briefDescription, description, urlVideo, experience };
        }).filter(Boolean);
    };

    const parseTestText = (text) => {
        if (!text) return null;

        const questions = [];
        const questionRegex = /Вопрос\s*\d+[:.]\s*([\s\S]*?)(?=Вопрос\s*\d+[:.]|$)/g;
        let match;

        while ((match = questionRegex.exec(text)) !== null) {
            const block = match[1].trim();
            if (!block) continue;

            // Разделение на строки
            const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
            if (lines.length === 0) continue;

            const title = lines[0];
            let optionsText = lines.slice(1).join(' '); // Склеиваем все строки, кроме первой

            const optionRegex = /([a-z])\)\s*([^a-z]*)/gi;
            const answers = [];
            let correctAnswerLetter = null;

            let optionMatch;
            while ((optionMatch = optionRegex.exec(optionsText)) !== null) {
                const letter = optionMatch[1].toLowerCase();
                const text = optionMatch[2].trim();
                if (text) {
                    answers.push({ letter, title: text, isCorrect: false, explanation: '' });
                }
            }

            // Определяем правильный ответ
            const correctLine = lines.find(line => line.toLowerCase().includes('правильный ответ:'));
            if (correctLine) {
                const correctLetter = correctLine.match(/:\s*([a-z])/i)?.[1]?.toLowerCase();
                correctAnswerLetter = correctLetter || null;
            }

            if (correctAnswerLetter) {
                answers.forEach(ans => {
                    if (ans.letter === correctAnswerLetter) ans.isCorrect = true;
                });
            }

            if (answers.length > 0) {
                questions.push({
                    title,
                    explanation: '',
                    answers: answers.map(({ letter, ...rest }) => rest),
                });
            }
        }

        return questions.length ? { questions } : null;
    };

    const handleSubmitUpload = async () => {
        if (!files.lessons && !files.test) {
            setError('Выберите хотя бы один файл (уроки или тест).');
            return;
        }

        setError('');
        setIsProcessing(true);

        try {
            const lessonsText = files.lessons ? await extractTextFromDocx(files.lessons) : '';
            const parsedLessons = lessonsText ? parseLessonsText(lessonsText) : [];

            const testText = files.test ? await extractTextFromDocx(files.test) : '';
            const parsedTest = testText ? parseTestText(testText) : null;

            onUploadComplete(blockIndex, parsedLessons, parsedTest);

            setFiles({ lessons: null, test: null });
        } catch (err) {
            console.error(err);
            setError(err.message || 'Ошибка при обработке файлов.');
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (!show) {
            setFiles({ lessons: null, test: null });
            setError('');
            setIsProcessing(false);
        }
    }, [show]);

    return (
        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>Загрузить контент для блока {blockIndex !== null ? blockIndex + 1 : ''}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Файл с уроками (.docx)</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".docx"
                            onChange={handleFileChange('lessons')}
                            disabled={isProcessing}
                        />
                        <Form.Text>
                            Уроки разделяются '===', используются ключевые слова: Название:, Краткое описание:, Описание:, Видео:, Опыт:.
                        </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Файл с тестом (.docx)</Form.Label>
                        <Form.Control
                            type="file"
                            accept=".docx"
                            onChange={handleFileChange('test')}
                            disabled={isProcessing}
                        />
                        <Form.Text>
                            Формат: "Вопрос X.", варианты "a) ...", "b) ...", строка "Правильный ответ: a".
                        </Form.Text>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={isProcessing}>
                    Отмена
                </Button>
                <Button
                    variant="primary"
                    onClick={handleSubmitUpload}
                    disabled={isProcessing || (!files.lessons && !files.test)}
                >
                    {isProcessing ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Загрузить и обработать'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default BlockContentUploader;
