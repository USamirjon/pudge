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
                lessons: [],
                additionalMaterials: []
            }
        ],
    });

    // Состояния для свернутых блоков, тестов и уроков
    const [collapsedBlocks, setCollapsedBlocks] = useState({});
    const [collapsedTests, setCollapsedTests] = useState({});
    const [collapsedLessons, setCollapsedLessons] = useState({});

    // Переключение состояния свернутости блока
    const toggleBlockCollapse = (blockIndex) => {
        setCollapsedBlocks({
            ...collapsedBlocks,
            [blockIndex]: !collapsedBlocks[blockIndex]
        });
    };

    // Переключение состояния свернутости теста
    const toggleTestCollapse = (blockIndex) => {
        setCollapsedTests({
            ...collapsedTests,
            [blockIndex]: !collapsedTests[blockIndex]
        });
    };

    // Переключение состояния свернутости урока
    const toggleLessonCollapse = (blockIndex, lessonIndex) => {
        const key = `${blockIndex}-${lessonIndex}`;
        setCollapsedLessons({
            ...collapsedLessons,
            [key]: !collapsedLessons[key]
        });
    };

    // Обработка изменений основных данных курса
    const handleCourseChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCourseData({
            ...courseData,
            [name]: type === 'checkbox' ? checked :
                type === 'number' ? parseFloat(value) : value
        });
    };

    // Обработка изменений данных блока
    const handleBlockChange = (blockIndex, e) => {
        const { name, value } = e.target;
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex] = { ...updatedBlocks[blockIndex], [name]: value };
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Добавление нового блока
    const addBlock = () => {
        const newBlock = {
            title: '',
            numberOfBLock: courseData.blocks.length + 1,
            test: {
                questions: []
            },
            lessons: [],
            additionalMaterials: []
        };

        setCourseData({
            ...courseData,
            blocks: [...courseData.blocks, newBlock]
        });
    };

    // Удаление блока
    const removeBlock = (blockIndex) => {
        if (courseData.blocks.length > 1) {
            const updatedBlocks = courseData.blocks.filter((_, idx) => idx !== blockIndex);
            updatedBlocks.forEach((block, idx) => block.numberOfBLock = idx + 1);
            setCourseData({ ...courseData, blocks: updatedBlocks });
        } else {
            toast.error('Курс должен содержать как минимум один блок');
        }
    };

    // Проверка наличия вопросов в тесте блока
    const hasTestQuestions = (blockIndex) => {
        return courseData.blocks[blockIndex].test &&
            courseData.blocks[blockIndex].test.questions &&
            courseData.blocks[blockIndex].test.questions.length > 0;
    };

    // Обработка изменений данных вопроса
    const handleQuestionChange = (blockIndex, questionIndex, e) => {
        const { name, value } = e.target;
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex].test.questions[questionIndex] = {
            ...updatedBlocks[blockIndex].test.questions[questionIndex],
            [name]: value
        };
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Добавление нового вопроса
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

    // Удаление вопроса
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

    // Обработка изменений данных ответа
    const handleAnswerChange = (blockIndex, questionIndex, answerIndex, e) => {
        const { name, value, type, checked } = e.target;
        const updatedBlocks = [...courseData.blocks];
        const answers = updatedBlocks[blockIndex].test.questions[questionIndex].answers;

        answers[answerIndex] = {
            ...answers[answerIndex],
            [name]: type === 'checkbox' ? checked : value
        };

        // Если этот ответ отмечен как правильный, делаем остальные неправильными
        if (name === 'isCorrect' && checked) {
            answers.forEach((answer, idx) => {
                if (idx !== answerIndex) answer.isCorrect = false;
            });
        }

        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Добавление нового ответа
    const addAnswer = (blockIndex, questionIndex) => {
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex].test.questions[questionIndex].answers.push({
            title: '',
            isCorrect: false,
            explanation: ''
        });
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Удаление ответа
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

    // Добавление нового урока
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

    // Обработка изменений данных урока
    const handleLessonChange = (blockIndex, lessonIndex, e) => {
        const { name, value, type } = e.target;
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex].lessons[lessonIndex] = {
            ...updatedBlocks[blockIndex].lessons[lessonIndex],
            [name]: type === 'number' ? parseFloat(value) : value
        };
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Удаление урока
    const removeLesson = (blockIndex, lessonIndex) => {
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex].lessons.splice(lessonIndex, 1);
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Парсинг ссылки Telegram для извлечения ID чата и сообщения
    const parseTelegramLink = (link) => {
        try {
            // Формат ссылки: https://t.me/c/2261733387/37
            const regex = /https:\/\/t\.me\/c\/(\d+)\/(\d+)/;
            const match = link.match(regex);

            if (match && match.length === 3) {
                return {
                    telegramChatId: -1002261733387, // Используем фиксированный ID чата из примера
                    telegramMessageId: parseInt(match[2])
                };
            }
            return null;
        } catch (error) {
            console.error('Ошибка при парсинге ссылки Telegram:', error);
            return null;
        }
    };

    // Добавление нового дополнительного материала
    const addMaterial = (blockIndex) => {
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex].additionalMaterials = updatedBlocks[blockIndex].additionalMaterials || [];
        updatedBlocks[blockIndex].additionalMaterials.push({
            telegramChatId: -1002261733387,
            telegramMessageId: '',
            telegramLink: '',
            triggerKey: ''
        });
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Обработка изменений данных материала
    const handleMaterialChange = (blockIndex, materialIndex, e) => {
        const { name, value } = e.target;
        const updatedBlocks = [...courseData.blocks];

        if (name === 'telegramLink') {
            // Парсинг ссылки Telegram
            const parsedData = parseTelegramLink(value);
            if (parsedData) {
                updatedBlocks[blockIndex].additionalMaterials[materialIndex] = {
                    ...updatedBlocks[blockIndex].additionalMaterials[materialIndex],
                    telegramLink: value,
                    telegramChatId: parsedData.telegramChatId,
                    telegramMessageId: parsedData.telegramMessageId,
                    triggerKey: updatedBlocks[blockIndex].title // Автоматически устанавливаем triggerKey как название блока
                };
            } else {
                updatedBlocks[blockIndex].additionalMaterials[materialIndex] = {
                    ...updatedBlocks[blockIndex].additionalMaterials[materialIndex],
                    telegramLink: value
                };
            }
        } else {
            updatedBlocks[blockIndex].additionalMaterials[materialIndex] = {
                ...updatedBlocks[blockIndex].additionalMaterials[materialIndex],
                [name]: name === 'telegramMessageId' ? parseInt(value) : value
            };
        }

        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Удаление дополнительного материала
    const removeMaterial = (blockIndex, materialIndex) => {
        const updatedBlocks = [...courseData.blocks];
        updatedBlocks[blockIndex].additionalMaterials.splice(materialIndex, 1);
        setCourseData({ ...courseData, blocks: updatedBlocks });
    };

    // Базовая валидация формы
    const validateForm = () => {
        if (!courseData.title) return 'Заголовок курса обязателен';
        if (!courseData.description) return 'Описание курса обязательно';
        if (courseData.discount && courseData.priceWithDiscount >= courseData.price) {
            return 'Цена со скидкой должна быть меньше основной цены';
        }

        // Здесь можно добавить дополнительные проверки

        return null;
    };

    // Подготовка данных для отправки, удаление пустых объектов тестов
    const prepareDataForSubmission = () => {
        // Создаем глубокую копию courseData, чтобы избежать мутации состояния
        const processedData = JSON.parse(JSON.stringify(courseData));

        // Обрабатываем каждый блок
        processedData.blocks = processedData.blocks.map(block => {
            // Если в блоке нет вопросов теста, удаляем свойство test
            if (!block.test || !block.test.questions || block.test.questions.length === 0) {
                const { test, ...blockWithoutTest } = block;
                return blockWithoutTest;
            }
            return block;
        });

        return processedData;
    };

    // Отправка дополнительных материалов на API
    const submitAdditionalMaterials = async () => {
        let hasErrors = false;

        // Получаем токен из localStorage
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Токен авторизации не найден');
            return false;
        }

        // Перебираем все блоки и их материалы
        for (const block of courseData.blocks) {
            if (!block.additionalMaterials || block.additionalMaterials.length === 0) continue;

            // Устанавливаем triggerKey как название блока, если не задан
            for (const material of block.additionalMaterials) {
                if (!material.triggerKey) {
                    material.triggerKey = block.title;
                }

                try {
                    await axios.post(`${URL}/api/Notifications/material`, {
                        triggerKey: material.triggerKey,
                        telegramChatId: material.telegramChatId,
                        telegramMessageId: material.telegramMessageId
                    }, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                } catch (error) {
                    console.error('Ошибка при добавлении дополнительного материала:', error);
                    toast.error(`Ошибка при добавлении дополнительного материала: ${error.message}`);
                    hasErrors = true;
                }
            }
        }

        return !hasErrors;
    };

    // Отправка формы
    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validateForm();
        if (error) {
            toast.error(error);
            return;
        }

        // Подготовка данных, удаление пустых тестов
        const dataToSubmit = prepareDataForSubmission();

        try {
            setLoading(true);

            // Сначала создаем курс
            const response = await axios.post(URL+'/api/Courses', dataToSubmit);

            // Затем отправляем дополнительные материалы
            const materialsSuccess = await submitAdditionalMaterials();

            if (materialsSuccess) {
                toast.success('Курс успешно создан со всеми дополнительными материалами!');
            } else {
                toast.warning('Курс создан, но возникли проблемы с некоторыми дополнительными материалами');
            }

            console.log('Курс создан:', response.data);
        } catch (error) {
            console.error('Ошибка при создании курса:', error);
            toast.error(error.response?.data?.message || 'Ошибка при создании курса');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4 mb-5">
            <h1 className="mb-4">Создание нового курса</h1>

            <form onSubmit={handleSubmit}>
                {/* Основная информация о курсе */}
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

                {/* Блоки курса */}
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
                                <div className="d-flex align-items-center">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary me-2"
                                        onClick={() => toggleBlockCollapse(blockIndex)}
                                    >
                                        {collapsedBlocks[blockIndex] ? '+' : '-'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeBlock(blockIndex)}
                                        className="btn btn-sm btn-outline-danger"
                                    >
                                        Удалить блок
                                    </button>
                                </div>
                            </div>
                            {!collapsedBlocks[blockIndex] && (
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

                                    {/* Дополнительные материалы */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5>Дополнительные материалы</h5>
                                            <button
                                                type="button"
                                                onClick={() => addMaterial(blockIndex)}
                                                className="btn btn-sm btn-primary"
                                            >
                                                Добавить материал
                                            </button>
                                        </div>

                                        {block.additionalMaterials && block.additionalMaterials.length > 0 ? (
                                            block.additionalMaterials.map((material, materialIndex) => (
                                                <div key={materialIndex} className="card mb-3 bg-light">
                                                    <div className="card-header d-flex justify-content-between align-items-center">
                                                        <h6 className="mb-0">Материал {materialIndex + 1}</h6>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeMaterial(blockIndex, materialIndex)}
                                                            className="btn btn-sm btn-outline-danger"
                                                        >
                                                            Удалить материал
                                                        </button>
                                                    </div>
                                                    <div className="card-body">
                                                        <div className="mb-3">
                                                            <label className="form-label">Ссылка на материал в Telegram *</label>
                                                            <input
                                                                type="text"
                                                                name="telegramLink"
                                                                value={material.telegramLink}
                                                                onChange={(e) => handleMaterialChange(blockIndex, materialIndex, e)}
                                                                className="form-control"
                                                                placeholder="https://t.me/c/2261733387/37"
                                                                required
                                                            />
                                                        </div>
                                                        {material.telegramMessageId && (
                                                            <div className="mb-3">
                                                                <p className="text-success">
                                                                    <small>✓ ID сообщения успешно извлечен: {material.telegramMessageId}</small>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="alert alert-light">
                                                <p className="text-muted mb-0">Дополнительные материалы не добавлены.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Тесты блока */}
                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="mb-0">Тест для блока (необязательно)</h5>
                                            <div className="d-flex align-items-center">
                                                {hasTestQuestions(blockIndex) && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary me-2"
                                                        onClick={() => toggleTestCollapse(blockIndex)}
                                                    >
                                                        {collapsedTests[blockIndex] ? '+' : '-'}
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => addQuestion(blockIndex)}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    {hasTestQuestions(blockIndex) ? 'Добавить вопрос' : 'Добавить тест'}
                                                </button>
                                            </div>
                                        </div>

                                        {hasTestQuestions(blockIndex) && !collapsedTests[blockIndex] ? (
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
                                        ) : hasTestQuestions(blockIndex) && collapsedTests[blockIndex] ? (
                                            <div className="d-flex justify-content-between align-items-center border p-3 bg-light">
                                                <span>Тест: {block.test.questions.length} вопросов</span>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => toggleTestCollapse(blockIndex)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="alert alert-light">
                                                <p className="text-muted mb-0">Тест для этого блока не добавлен. Нажмите "Добавить тест", чтобы создать тест.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Уроки блока */}
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

                                        {block.lessons && block.lessons.length > 0 ? (
                                            <div className="lessons-list">
                                                {block.lessons.map((lesson, lessonIndex) => {
                                                    const isCollapsed = collapsedLessons[`${blockIndex}-${lessonIndex}`];

                                                    if (isCollapsed) {
                                                        return (
                                                            <div key={lessonIndex} className="d-flex justify-content-between align-items-center p-3 border mb-2 bg-light">
                                                                <span>Урок {lessonIndex + 1}: {lesson.title || 'Без названия'}</span>
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={() => toggleLessonCollapse(blockIndex, lessonIndex)}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        );
                                                    } else {
                                                        return (
                                                            <div key={lessonIndex} className="card mb-3 bg-light">
                                                                <div className="card-header d-flex justify-content-between align-items-center">
                                                                    <h6 className="mb-0">
                                                                        Урок {lessonIndex + 1}: {lesson.title || 'Без названия'}
                                                                    </h6>
                                                                    <div className="d-flex align-items-center">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-outline-secondary me-2"
                                                                            onClick={() => toggleLessonCollapse(blockIndex, lessonIndex)}
                                                                        >
                                                                            -
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeLesson(blockIndex, lessonIndex)}
                                                                            className="btn btn-sm btn-outline-danger"
                                                                        >
                                                                            Удалить урок
                                                                        </button>
                                                                    </div>
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
                                                        );
                                                    }
                                                })}
                                            </div>
                                        ) : (
                                            <div className="alert alert-light">
                                                <p className="text-muted mb-0">Уроки не добавлены.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {collapsedBlocks[blockIndex] && (
                                <div className="d-flex justify-content-between align-items-center p-3">
                                    <div>
                                        <span className="fw-bold">{block.title || 'Блок без названия'}</span>
                                        <span className="text-muted ms-3">
                                            Уроков: {block.lessons ? block.lessons.length : 0} |
                                            Тест: {hasTestQuestions(blockIndex) ? 'Да' : 'Нет'} |
                                            Материалов: {block.additionalMaterials ? block.additionalMaterials.length : 0}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => toggleBlockCollapse(blockIndex)}
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Кнопка отправки */}
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


