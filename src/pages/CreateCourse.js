import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import HtmlEditor from './HtmlEditor';
import {URL} from '../domain.ts';

const CreateCourse = () => {
    const [loading, setLoading] = useState(false);
    const [courseData, setCourseData] = useState({
        title: '',
        briefDescription: '',
        description: '',
        price: 0,
        discount: false,
        priceWithDiscount: 0,
        blocks: [
            {
                title: '',
                numberOfBLock: 1,
                test: {
                    questions: []
                },
                lessons: []
            }
        ],
    });

    // Handle changes to the main course data
    const handleCourseChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCourseData({
            ...courseData,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? parseFloat(value) : value
        });
    };

    // Handle changes to block data
    const handleBlockChange = (blockIndex, e) => {
        const { name, value } = e.target;
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex] = { ...updatedBlocks[blockIndex], [name]: value };
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Add a new block
    const addBlock = () => {
        const newBlock = {
            title: '',
            numberOfBLock: courseData.blocks.length + 1,
            test: {
                questions: []
            },
            lessons: []
        };

        setCourseData({
            ...courseData,
            blocks: [...courseData.blocks, newBlock]
        });
    };

    // Remove a block
    const removeBlock = (blockIndex) => {
        if (courseData.blocks.length > 1) {
            const updatedBlocks = courseData.blocks.filter((_, idx) => idx !== blockIndex);
            updatedBlocks.forEach((block, idx) => block.numberOfBLock = idx + 1);
            setCourseData({ ...courseData, blocks: updatedBlocks });
        } else {
            toast.error('Курс должен содержать как минимум один блок');
        }
    };

    // Check if block has test questions
    const hasTestQuestions = (blockIndex) => {
        return courseData.blocks[blockIndex].test &&
            courseData.blocks[blockIndex].test.questions &&
            courseData.blocks[blockIndex].test.questions.length > 0;
    };

    // Handle changes to question data
    const handleQuestionChange = (blockIndex, questionIndex, e) => {
        const { name, value } = e.target;
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex].test.questions[questionIndex] = {
            ...updatedBlocks[blockIndex].test.questions[questionIndex],
            [name]: value
        };
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Add a new question
    const addQuestion = (blockIndex) => {
        const updatedBlocks = [...courseData.blocks];

        // Если вопросов ещё нет, инициализируем массив
        if (!updatedBlocks[blockIndex].test.questions) {
            updatedBlocks[blockIndex].test.questions = [];
        }

        const newQuestion = {
            title: '',
            explanation: '',
            answers: [
                { title: '', isCorrect: true, explanation: '' },
                { title: '', isCorrect: false, explanation: '' }
            ]
        };

        updatedBlocks[blockIndex].test.questions.push(newQuestion);
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Remove a question
    const removeQuestion = (blockIndex, questionIndex) => {
        const updatedBlocks = [...courseData.blocks];

        if (updatedBlocks[blockIndex].test.questions.length > 1) {
            updatedBlocks[blockIndex].test.questions.splice(questionIndex, 1);
        } else {
            // Если это последний вопрос, очищаем массив вопросов
            updatedBlocks[blockIndex].test.questions = [];
        }

        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Handle changes to answer data
    const handleAnswerChange = (blockIndex, questionIndex, answerIndex, e) => {
        const { name, value, type, checked } = e.target;
        const updatedBlocks = [...courseData.blocks];
        const answers = updatedBlocks[blockIndex].test.questions[questionIndex].answers;

        answers[answerIndex] = {
            ...answers[answerIndex],
            [name]: type === 'checkbox' ? checked : value
        };

        // If this answer is marked correct, make others incorrect
        if (name === 'isCorrect' && checked) {
            answers.forEach((answer, idx) => {
                if (idx !== answerIndex) answer.isCorrect = false;
            });
        }

        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Add a new answer
    const addAnswer = (blockIndex, questionIndex) => {
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex].test.questions[questionIndex].answers.push({
            title: '',
            isCorrect: false,
            explanation: ''
        });
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Remove an answer
    const removeAnswer = (blockIndex, questionIndex, answerIndex) => {
        const answers = courseData.blocks[blockIndex].test.questions[questionIndex].answers;
        if (answers.length > 2) {
            const updatedBlocks = [...courseData.blocks];
            const isRemovingCorrect = answers[answerIndex].isCorrect;

            updatedBlocks[blockIndex].test.questions[questionIndex].answers.splice(answerIndex, 1);

            if (isRemovingCorrect) {
                updatedBlocks[blockIndex].test.questions[questionIndex].answers[0].isCorrect = true;
            }

            setCourseData({ ...courseData, blocks: updatedBlocks });
        } else {
            toast.error('Вопрос должен содержать как минимум два варианта ответа');
        }
    };

    // Add a new lesson
    const addLesson = (blockIndex) => {
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex].lessons = updatedBlocks[blockIndex].lessons || [];
        updatedBlocks[blockIndex].lessons.push({
            title: '',
            briefDescription: '',
            description: '',
            experience: 0
        });
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Handle changes to lesson data
    const handleLessonChange = (blockIndex, lessonIndex, e) => {
        const { name, value, type } = e.target;
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex].lessons[lessonIndex] = {
            ...updatedBlocks[blockIndex].lessons[lessonIndex],
            [name]: type === 'number' ? parseFloat(value) : value
        };
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Remove a lesson
    const removeLesson = (blockIndex, lessonIndex) => {
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex].lessons.splice(lessonIndex, 1);
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Basic form validation
    const validateForm = () => {
        if (!courseData.title) return 'Заголовок курса обязателен';
        if (!courseData.description) return 'Описание курса обязательно';
        if (courseData.discount && courseData.priceWithDiscount >= courseData.price) {
            return 'Цена со скидкой должна быть меньше основной цены';
        }

        // More validation checks could be added here

        return null;
    };

    // Submit the form
    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validateForm();
        if (error) {
            toast.error(error);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(URL+'/api/Courses', courseData);
            toast.success('Курс успешно создан!');
            console.log('Course created:', response.data);
        } catch (error) {
            console.error('Error creating course:', error);
            toast.error(error.response?.data?.message || 'Ошибка при создании курса');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4 mb-5">
            <h1 className="mb-4">Создание нового курса</h1>

            <form onSubmit={handleSubmit}>
                {/* Course Basic Information */}
                <div className="card mb-4">
                    <div className="card-header bg-primary text-white">
                        <h5 className="mb-0">Основная информация</h5>
                    </div>
                    <div className="card-body">
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Название курса *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={courseData.title}
                                    onChange={handleCourseChange}
                                    className="form-control"
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label">Краткое описание *</label>
                                <input
                                    type="text"
                                    name="briefDescription"
                                    value={courseData.briefDescription}
                                    onChange={handleCourseChange}
                                    className="form-control"
                                    required
                                />
                            </div>

                        </div>

                        <div className="mb-3">
                            <label className="form-label">Полное описание *</label>
                            <textarea
                                name="description"
                                value={courseData.description}
                                onChange={handleCourseChange}
                                className="form-control"
                                rows="3"
                                required
                            />
                        </div>

                        <div className="row">
                            <div className="col-md-4">
                                <label className="form-label">Цена (руб.) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={courseData.price}
                                    onChange={handleCourseChange}
                                    className="form-control"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="col-md-4 d-flex align-items-center">
                                <div className="form-check mt-4">
                                    <input
                                        type="checkbox"
                                        name="discount"
                                        checked={courseData.discount}
                                        onChange={handleCourseChange}
                                        className="form-check-input"
                                        id="discountCheckbox"
                                    />
                                    <label className="form-check-label" htmlFor="discountCheckbox">
                                        Применить скидку
                                    </label>
                                </div>
                            </div>
                            {courseData.discount && (
                                <div className="col-md-4">
                                    <label className="form-label">Цена со скидкой (руб.) *</label>
                                    <input
                                        type="number"
                                        name="priceWithDiscount"
                                        value={courseData.priceWithDiscount}
                                        onChange={handleCourseChange}
                                        className="form-control"
                                        min="0"
                                        max={courseData.price}
                                        required
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Course Blocks */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h3>Блоки курса</h3>
                        <button
                            type="button"
                            onClick={addBlock}
                            className="btn btn-success"
                        >
                            Добавить блок
                        </button>
                    </div>

                    {courseData.blocks.map((block, blockIndex) => (
                        <div key={blockIndex} className="card mb-4">
                            <div className="card-header d-flex justify-content-between align-items-center bg-light">
                                <h5 className="mb-0">Блок {block.numberOfBLock}</h5>
                                <button
                                    type="button"
                                    onClick={() => removeBlock(blockIndex)}
                                    className="btn btn-sm btn-outline-danger"
                                >
                                    Удалить блок
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label">Название блока *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={block.title}
                                        onChange={(e) => handleBlockChange(blockIndex, e)}
                                        className="form-control"
                                        required
                                    />
                                </div>

                                {/* Block Tests */}
                                <div className="mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5>Тест для блока (необязательно)</h5>
                                        <button
                                            type="button"
                                            onClick={() => addQuestion(blockIndex)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            {hasTestQuestions(blockIndex) ? 'Добавить вопрос' : 'Добавить тест'}
                                        </button>
                                    </div>

                                    {hasTestQuestions(blockIndex) ? (
                                        block.test.questions.map((question, questionIndex) => (
                                            <div key={questionIndex} className="card mb-3 bg-light">
                                                <div className="card-header d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0">Вопрос {questionIndex + 1}</h6>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeQuestion(blockIndex, questionIndex)}
                                                        className="btn btn-sm btn-outline-danger"
                                                    >
                                                        Удалить вопрос
                                                    </button>
                                                </div>
                                                <div className="card-body">
                                                    <div className="mb-3">
                                                        <label className="form-label">Текст вопроса *</label>
                                                        <input
                                                            type="text"
                                                            name="title"
                                                            value={question.title}
                                                            onChange={(e) => handleQuestionChange(blockIndex, questionIndex, e)}
                                                            className="form-control"
                                                            required
                                                        />
                                                    </div>

                                                    <div className="mb-3">
                                                        <label className="form-label">Пояснение к вопросу</label>
                                                        <input
                                                            type="text"
                                                            name="explanation"
                                                            value={question.explanation}
                                                            onChange={(e) => handleQuestionChange(blockIndex, questionIndex, e)}
                                                            className="form-control"
                                                        />
                                                    </div>

                                                    <div className="mt-3">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <h6>Варианты ответов</h6>
                                                            <button
                                                                type="button"
                                                                onClick={() => addAnswer(blockIndex, questionIndex)}
                                                                className="btn btn-sm btn-secondary"
                                                            >
                                                                Добавить ответ
                                                            </button>
                                                        </div>

                                                        {question.answers.map((answer, answerIndex) => (
                                                            <div key={answerIndex} className="card mb-2">
                                                                <div className="card-body">
                                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                                        <div className="form-check">
                                                                            <input
                                                                                type="checkbox"
                                                                                name="isCorrect"
                                                                                checked={answer.isCorrect}
                                                                                onChange={(e) => handleAnswerChange(blockIndex, questionIndex, answerIndex, e)}
                                                                                className="form-check-input"
                                                                                id={`correct-${blockIndex}-${questionIndex}-${answerIndex}`}
                                                                            />
                                                                            <label className="form-check-label" htmlFor={`correct-${blockIndex}-${questionIndex}-${answerIndex}`}>
                                                                                Правильный ответ
                                                                            </label>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeAnswer(blockIndex, questionIndex, answerIndex)}
                                                                            className="btn btn-sm btn-outline-danger"
                                                                        >
                                                                            Удалить
                                                                        </button>
                                                                    </div>

                                                                    <div className="mb-2">
                                                                        <label className="form-label">Текст ответа *</label>
                                                                        <input
                                                                            type="text"
                                                                            name="title"
                                                                            value={answer.title}
                                                                            onChange={(e) => handleAnswerChange(blockIndex, questionIndex, answerIndex, e)}
                                                                            className="form-control"
                                                                            required
                                                                        />
                                                                    </div>

                                                                    <div>
                                                                        <label className="form-label">Пояснение к ответу</label>
                                                                        <input
                                                                            type="text"
                                                                            name="explanation"
                                                                            value={answer.explanation}
                                                                            onChange={(e) => handleAnswerChange(blockIndex, questionIndex, answerIndex, e)}
                                                                            className="form-control"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="alert alert-light">
                                            <p className="text-muted mb-0">Тест для этого блока не добавлен. Нажмите "Добавить тест", чтобы создать тест.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Block Lessons */}
                                <div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5>Уроки блока</h5>
                                        <button
                                            type="button"
                                            onClick={() => addLesson(blockIndex)}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Добавить урок
                                        </button>
                                    </div>

                                    {block.lessons && block.lessons.map((lesson, lessonIndex) => (
                                        <div key={lessonIndex} className="card mb-3 bg-light">
                                            <div className="card-header d-flex justify-content-between align-items-center">
                                                <h6 className="mb-0">Урок {lessonIndex + 1}</h6>
                                                <button
                                                    type="button"
                                                    onClick={() => removeLesson(blockIndex, lessonIndex)}
                                                    className="btn btn-sm btn-outline-danger"
                                                >
                                                    Удалить урок
                                                </button>
                                            </div>
                                            <div className="card-body">
                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Название урока *</label>
                                                        <input
                                                            type="text"
                                                            name="title"
                                                            value={lesson.title}
                                                            onChange={(e) => handleLessonChange(blockIndex, lessonIndex, e)}
                                                            className="form-control"
                                                            required
                                                        />
                                                    </div>

                                                </div>

                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label">Краткое описание</label>
                                                        <input
                                                            type="text"
                                                            name="briefDescription"
                                                            value={lesson.briefDescription}
                                                            onChange={(e) => handleLessonChange(blockIndex, lessonIndex, e)}
                                                            className="form-control"
                                                        />
                                                    </div>
                                                    <div className="col-md-6">
                                                        <label className="form-label">Опыт за урок</label>
                                                        <input
                                                            type="number"
                                                            name="experience"
                                                            value={lesson.experience}
                                                            onChange={(e) => handleLessonChange(blockIndex, lessonIndex, e)}
                                                            className="form-control"
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <HtmlEditor
                                                        label="Описание урока (HTML) *"
                                                        value={lesson.description}
                                                        onChange={(htmlContent) => {
                                                            const e = { target: { name: 'description', value: htmlContent } };
                                                            handleLessonChange(blockIndex, lessonIndex, e);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit Button */}
                <div className="d-flex justify-content-end">
                    <button
                        type="submit"
                        className="btn btn-lg btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Создание...' : 'Создать курс'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCourse;