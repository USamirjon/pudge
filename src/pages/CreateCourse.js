import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Modal } from 'react-bootstrap'; // Added Modal
import axios from 'axios';
import { URL } from '../domain.ts';
import { useNavigate } from 'react-router-dom';
import BlockContentUploader from './BlockContentUploader'; // Import the new component

function CreateCourse() {
    const navigate = useNavigate();
    const [course, setCourse] = useState({
        title: '',
        urlVideo: '',
        briefDescription: '',
        description: '',
        price: 0,
        discount: false,
        priceWithDiscount: 0,
        blocks: []
    });

    // --- State for Upload Modal ---
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [targetBlockIndex, setTargetBlockIndex] = useState(null);

    // --- Modal Handlers ---
    const handleShowUploadModal = (blockIndex) => {
        setTargetBlockIndex(blockIndex);
        setShowUploadModal(true);
    };

    const handleCloseUploadModal = () => {
        setShowUploadModal(false);
        setTargetBlockIndex(null);
    };

    // --- Callback for Upload Component ---
    const handleContentUpload = (blockIndex, parsedLessons, parsedTest) => {
        if (blockIndex === null || blockIndex < 0) return; // Safety check

        setCourse(prev => {
            const updatedBlocks = [...prev.blocks];
            if (updatedBlocks[blockIndex]) {
                // Merge lessons intelligently: Keep existing lessons if parsedLessons is empty?
                // Or replace completely? Let's replace for simplicity now.
                // If you want to ADD instead of replacing, adjust logic here.
                updatedBlocks[blockIndex].lessons = parsedLessons || updatedBlocks[blockIndex].lessons;

                // Update or add the test
                // If parsedTest is null and a test existed, keep it? Or remove it?
                // Current logic: If test file was uploaded, replace/add test. If not, keep existing.
                if (parsedTest) {
                    updatedBlocks[blockIndex].test = parsedTest;
                } else if (parsedTest === null) {
                    // Explicitly handle if no test file was chosen but one might exist
                    // E.g., keep existing: do nothing here
                    // E.g., remove existing if no test file uploaded: updatedBlocks[blockIndex].test = null;
                    // Let's assume we only update the test if a test file was processed.
                }
            }
            return { ...prev, blocks: updatedBlocks };
        });
        handleCloseUploadModal(); // Close modal after updating state
        alert(`Содержимое для блока ${blockIndex + 1} обновлено!`);
    };


    // --- Existing State Handlers (handleChange, addBlock, etc.) ---
    // (Keep all your existing handlers: handleChange, addBlock, updateBlockTitle,
    // addLesson, updateLesson, toggleTest, addQuestion, updateQuestion, addAnswer, updateAnswer)
    // ... (rest of your handlers from the original CreateCourse component) ...
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : (type === 'number' ? parseInt(value, 10) || 0 : value);
        setCourse(prev => ({ ...prev, [name]: val }));
    };

    const addBlock = () => {
        setCourse(prev => ({
            ...prev,
            blocks: [...prev.blocks, {
                title: '',
                numberOfBLock: prev.blocks.length,
                lessons: [],
                test: null // Изначально теста нет
            }]
        }));
    };

    const updateBlockTitle = (index, value) => {
        const updatedBlocks = [...course.blocks];
        updatedBlocks[index].title = value;
        updatedBlocks[index].numberOfBLock = index; // Обновляем номер блока
        setCourse(prev => ({ ...prev, blocks: updatedBlocks }));
    };

    const addLesson = (blockIndex) => {
        setCourse(prev => ({
            ...prev,
            blocks: prev.blocks.map((block, idx) => {
                if (idx === blockIndex) {
                    return {
                        ...block,
                        lessons: [...block.lessons, {
                            title: '',
                            briefDescription: '',
                            description: '',
                            urlVideo: '',
                            experience: 0
                        }]
                    };
                }
                return block;
            })
        }));
    };

    const updateLesson = (blockIndex, lessonIndex, field, value) => {
        setCourse(prev => ({
            ...prev,
            blocks: prev.blocks.map((block, idx) => {
                if (idx === blockIndex) {
                    return {
                        ...block,
                        lessons: block.lessons.map((lesson, lIdx) => {
                            if (lIdx === lessonIndex) {
                                return {
                                    ...lesson,
                                    [field]: field === 'experience' ? parseInt(value, 10) || 0 : value
                                };
                            }
                            return lesson;
                        })
                    };
                }
                return block;
            })
        }));
    };

    const toggleTest = (blockIndex) => {
        setCourse(prev => ({
            ...prev,
            blocks: prev.blocks.map((block, idx) => {
                if (idx === blockIndex) {
                    // Only toggle if not managed by DOCX upload, or provide clear logic
                    // If using DOCX upload, maybe disable this button or change its function?
                    // For now, it adds/removes an empty test structure manually.
                    return {
                        ...block,
                        test: block.test ? null : { // Переключаем наличие теста
                            questions: []
                        }
                    };
                }
                return block;
            })
        }));
    };

    const addQuestion = (blockIndex) => {
        setCourse(prev => ({
            ...prev,
            blocks: prev.blocks.map((block, idx) => {
                if (idx === blockIndex && block.test) {
                    return {
                        ...block,
                        test: {
                            ...block.test,
                            questions: [...block.test.questions, {
                                title: '',
                                explanation: '',
                                answers: []
                            }]
                        }
                    };
                }
                return block;
            })
        }));
    };

    const updateQuestion = (blockIndex, questionIndex, field, value) => {
        setCourse(prev => ({
            ...prev,
            blocks: prev.blocks.map((block, idx) => {
                if (idx === blockIndex && block.test) {
                    return {
                        ...block,
                        test: {
                            ...block.test,
                            questions: block.test.questions.map((question, qIdx) => {
                                if (qIdx === questionIndex) {
                                    return {
                                        ...question,
                                        [field]: value
                                    };
                                }
                                return question;
                            })
                        }
                    };
                }
                return block;
            })
        }));
    };

    const addAnswer = (blockIndex, questionIndex) => {
        setCourse(prev => ({
            ...prev,
            blocks: prev.blocks.map((block, idx) => {
                if (idx === blockIndex && block.test) {
                    return {
                        ...block,
                        test: {
                            ...block.test,
                            questions: block.test.questions.map((question, qIdx) => {
                                if (qIdx === questionIndex) {
                                    return {
                                        ...question,
                                        answers: [...question.answers, {
                                            title: '',
                                            isCorrect: false,
                                            explanation: ''
                                        }]
                                    };
                                }
                                return question;
                            })
                        }
                    };
                }
                return block;
            })
        }));
    };

    const updateAnswer = (blockIndex, questionIndex, answerIndex, field, value) => {
        setCourse(prev => ({
            ...prev,
            blocks: prev.blocks.map((block, idx) => {
                if (idx === blockIndex && block.test) {
                    return {
                        ...block,
                        test: {
                            ...block.test,
                            questions: block.test.questions.map((question, qIdx) => {
                                if (qIdx === questionIndex) {
                                    return {
                                        ...question,
                                        answers: question.answers.map((answer, aIdx) => {
                                            if (aIdx === answerIndex) {
                                                // Handle checkbox toggling correctly even if `value` isn't passed
                                                const val = field === 'isCorrect' ?
                                                    (typeof value === 'boolean' ? value : !answer.isCorrect) :
                                                    value;
                                                return {
                                                    ...answer,
                                                    [field]: val
                                                };
                                            }
                                            // Ensure only one answer is correct for radio-button style questions
                                            // If this needs multi-select, remove the next line
                                            // if (field === 'isCorrect' && val === true) {
                                            //     return { ...answer, isCorrect: false };
                                            // }
                                            return answer;
                                        })
                                    };
                                }
                                return question;
                            })
                        }
                    };
                }
                return block;
            })
        }));
    };


    // --- Submit Handler ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting Course:", JSON.stringify(course, null, 2)); // Debugging: Check the final structure
        try {
            // Filter blocks if needed (e.g., remove test: null) - Your existing logic is likely fine
            const courseToSend = {
                ...course,
                blocks: course.blocks.map(block => {
                    const { test, ...rest } = block;
                    // Send 'test' only if it's not null and has questions
                    return (test && test.questions && test.questions.length > 0) ? block : rest;
                })
            };

            console.log("Sending Payload:", JSON.stringify(courseToSend, null, 2)); // Debugging: Check the payload

            await axios.post(URL + '/api/courses', courseToSend);
            alert('Курс успешно создан!');
            navigate('/');
        } catch (error) {
            console.error("Ошибка при создании курса:", error.response?.data || error.message); // Log more details
            alert(`Ошибка при создании курса: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <Container className="py-4">
            <h2>Создание курса</h2>
            <Form onSubmit={handleSubmit}>
                {/* --- Course Details Form Groups (Title, URL, Descriptions, Price, etc.) --- */}
                {/* (Keep your existing form groups for course details) */}
                {/* Основная информация о курсе */}
                <Row className="mb-4">
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Название курса</Form.Label>
                            <Form.Control
                                name="title"
                                value={course.title}
                                onChange={handleChange}
                                placeholder="Название"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>URL видео (превью)</Form.Label>
                            <Form.Control
                                name="urlVideo"
                                value={course.urlVideo}
                                onChange={handleChange}
                                placeholder="https://example.com/video"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Краткое описание</Form.Label>
                            <Form.Control
                                name="briefDescription"
                                value={course.briefDescription}
                                onChange={handleChange}
                                placeholder="Краткое описание"
                                required
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>Полное описание</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        name="description"
                        value={course.description}
                        onChange={handleChange}
                        placeholder="Полное описание курса"
                        required
                    />
                </Form.Group>

                <Row className="mb-4">
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label>Цена (в копейках/центах)</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                value={course.price}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Есть скидка"
                                name="discount"
                                checked={course.discount}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                    {course.discount && (
                        <Col md={4}>
                            <Form.Group className="mb-3">
                                <Form.Label>Цена со скидкой</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="priceWithDiscount"
                                    value={course.priceWithDiscount}
                                    onChange={handleChange}
                                    required={course.discount}
                                />
                            </Form.Group>
                        </Col>
                    )}
                </Row>


                {/* --- Blocks Section --- */}
                <h4 className="mt-4">Блоки курса</h4>
                {course.blocks.map((block, blockIdx) => (
                    <Card key={blockIdx} className="mb-3 p-3">
                        <Form.Group className="mb-3">
                            <Form.Label>Название блока {blockIdx + 1}</Form.Label>
                            <Form.Control
                                value={block.title}
                                onChange={(e) => updateBlockTitle(blockIdx, e.target.value)}
                                placeholder={`Название блока ${blockIdx + 1}`}
                                required
                            />
                        </Form.Group>

                        {/* --- Action Buttons for the Block --- */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => addLesson(blockIdx)}
                                    className="me-2"
                                >
                                    Добавить урок вручную
                                </Button>
                                <Button
                                    variant={block.test ? "warning" : "outline-secondary"}
                                    size="sm"
                                    onClick={() => toggleTest(blockIdx)}
                                    className="me-2"
                                    title={block.test ? "Удалить тест (или замените загрузкой)" : "Добавить пустой тест"}
                                >
                                    {block.test ? "Удалить/Заменить тест" : "Добавить тест вручную"}
                                </Button>
                            </div>
                            {/* --- Upload Button --- */}
                            <Button
                                variant="info"
                                size="sm"
                                onClick={() => handleShowUploadModal(blockIdx)}
                            >
                                Загрузить уроки/тест из DOCX
                            </Button>
                        </div>


                        {/* --- Lessons in Block --- */}
                        {block.lessons.length > 0 && (
                            <>
                                <h5>Уроки блока</h5>
                                {block.lessons.map((lesson, lessonIdx) => (
                                    // Keep your existing Lesson Card rendering here
                                    // ... lesson card JSX ...
                                    <Card key={lessonIdx} className="mb-2 p-2 bg-light">
                                        <Form.Group className="mb-2">
                                            <Form.Label>Название урока {lessonIdx + 1}</Form.Label>
                                            <Form.Control
                                                value={lesson.title}
                                                onChange={(e) => updateLesson(blockIdx, lessonIdx, 'title', e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Label>Краткое описание</Form.Label>
                                            <Form.Control
                                                value={lesson.briefDescription}
                                                onChange={(e) => updateLesson(blockIdx, lessonIdx, 'briefDescription', e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Label>Полное описание</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                value={lesson.description}
                                                onChange={(e) => updateLesson(blockIdx, lessonIdx, 'description', e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Label>URL видео урока</Form.Label>
                                            <Form.Control
                                                value={lesson.urlVideo}
                                                onChange={(e) => updateLesson(blockIdx, lessonIdx, 'urlVideo', e.target.value)}
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Label>Опыт (XP)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                value={lesson.experience}
                                                onChange={(e) => updateLesson(blockIdx, lessonIdx, 'experience', e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                    </Card>
                                ))}
                            </>
                        )}

                        {/* --- Test in Block --- */}
                        {block.test && block.test.questions && block.test.questions.length > 0 && (
                            <>
                                <h5 className="mt-3">Тест блока</h5>
                                <Button
                                    variant="outline-success"
                                    size="sm"
                                    className="mb-3"
                                    onClick={() => addQuestion(blockIdx)}
                                >
                                    Добавить вопрос вручную
                                </Button>

                                {block.test.questions.map((question, questionIdx) => (
                                    // Keep your existing Question/Answer Card rendering here
                                    // ... question/answer card JSX ...
                                    <Card key={questionIdx} className="mb-3 p-3 bg-light">
                                        <Form.Group className="mb-2">
                                            <Form.Label>Вопрос {questionIdx + 1}</Form.Label>
                                            <Form.Control
                                                value={question.title}
                                                onChange={(e) => updateQuestion(blockIdx, questionIdx, 'title', e.target.value)}
                                                required
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Label>Объяснение (для вопроса)</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                value={question.explanation}
                                                onChange={(e) => updateQuestion(blockIdx, questionIdx, 'explanation', e.target.value)}
                                            />
                                        </Form.Group>

                                        <Button
                                            variant="outline-info"
                                            size="sm"
                                            className="mb-2"
                                            onClick={() => addAnswer(blockIdx, questionIdx)}
                                        >
                                            Добавить вариант ответа вручную
                                        </Button>

                                        {question.answers.map((answer, answerIdx) => (
                                            <Card key={answerIdx} className="mb-2 p-2">
                                                <Form.Group className="mb-2">
                                                    <Form.Label>Вариант ответа {answerIdx + 1}</Form.Label>
                                                    <Form.Control
                                                        value={answer.title}
                                                        onChange={(e) => updateAnswer(blockIdx, questionIdx, answerIdx, 'title', e.target.value)}
                                                        required
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-2 d-flex align-items-center">
                                                    <Form.Check
                                                        type="checkbox" // Using checkbox to allow toggling
                                                        label="Правильный ответ"
                                                        checked={answer.isCorrect}
                                                        onChange={() => updateAnswer(blockIdx, questionIdx, answerIdx, 'isCorrect')}
                                                    />
                                                </Form.Group>
                                                <Form.Group className="mb-2">
                                                    <Form.Label>Объяснение (для ответа)</Form.Label>
                                                    <Form.Control
                                                        as="textarea"
                                                        rows={1}
                                                        value={answer.explanation}
                                                        onChange={(e) => updateAnswer(blockIdx, questionIdx, answerIdx, 'explanation', e.target.value)}
                                                    />
                                                </Form.Group>
                                            </Card>
                                        ))}
                                    </Card>
                                ))}
                            </>
                        )}
                        {/* Display message if block has no lessons/test yet */}
                        {block.lessons.length === 0 && (!block.test || !block.test.questions || block.test.questions.length === 0) && (
                            <p className="text-muted">Добавьте уроки и/или тест вручную или загрузите из файла DOCX.</p>
                        )}
                    </Card>
                ))}

                {/* --- Add Block / Submit Buttons --- */}
                <div className="d-flex justify-content-between mt-4">
                    <Button variant="primary" onClick={addBlock}>Добавить блок</Button>
                    <Button type="submit" variant="success">Создать курс</Button>
                </div>
            </Form>

            {/* --- Upload Modal --- */}
            {targetBlockIndex !== null && (
                <BlockContentUploader
                    show={showUploadModal}
                    handleClose={handleCloseUploadModal}
                    blockIndex={targetBlockIndex}
                    onUploadComplete={handleContentUpload} // Pass the callback
                />
            )}
        </Container>
    );
}

export default CreateCourse;