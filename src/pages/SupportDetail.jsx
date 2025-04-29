import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { decodeToken } from '../components/jwtUtils';
import { URL } from "../domain.ts";

function SupportDetail() {
    const { id } = useParams();
    const [request, setRequest] = useState(null);
    const [processInput, setProcessInput] = useState('');
    const [statusSelect, setStatusSelect] = useState('');
    const [replyMessage, setReplyMessage] = useState('');
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [telegramId, setTelegramId] = useState(null);

    // Состояния для управления отображением форм
    const [showProcessForm, setShowProcessForm] = useState(false);
    const [showStatusForm, setShowStatusForm] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Инициализация общих констант при первой загрузке
    useEffect(() => {
        const storedToken = localStorage.getItem('token');

        if (!storedToken) {
            setError('Токен не найден. Выполните вход.');
            setLoading(false);
            return;
        }

        setToken(storedToken);

        try {
            const decoded = decodeToken(storedToken);
            console.log('Расшифрованный токен при заходе на страницу:', decoded);

            if (decoded?.UserId) {
                setUserId(decoded.UserId);
            }

            const storedTelegramId = localStorage.getItem('telegramId');
            if (storedTelegramId) {
                setTelegramId(storedTelegramId);
            }
        } catch (error) {
            console.error('Ошибка при декодировании токена:', error);
        }
    }, []);

    // Загрузка данных запроса с использованием useCallback
    const fetchRequest = useCallback(async () => {
        if (!token) return;

        setLoading(true);
        try {
            const response = await axios.get(`${URL}/api/Supports`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            const found = response.data.find(r => r.id === id);
            if (found) {
                let userFirstName = '';
                try {
                    const userResponse = await axios.get(`${URL}/api/Users/${found.userTelegramId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': '*/*'
                        }
                    });
                    userFirstName = userResponse.data.realFirstName;
                } catch (error) {
                    console.error('Ошибка при загрузке имени пользователя:', error);
                    userFirstName = 'Неизвестно';
                }

                setRequest({
                    ...found,
                    userFirstName: userFirstName
                });

                if (found.helper) {
                    const helperResponse = await axios.get(`${URL}/api/Users/${found.helper}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': '*/*'
                        }
                    });
                    setRequest(prevRequest => ({
                        ...prevRequest,
                        helperName: helperResponse.data.realFirstName || 'Неизвестно'
                    }));
                }
            } else {
                setError('Запрос не найден.');
            }
        } catch (error) {
            console.error('Ошибка при получении запроса:', error);
            setError('Ошибка при загрузке данных запроса.');
        } finally {
            setLoading(false);
        }
    }, [token, id]);

    // Вызов загрузки данных после инициализации токена
    useEffect(() => {
        if (token) {
            fetchRequest();
        }
    }, [token, fetchRequest]);

    // Общая функция для обработки API-запросов
    const handleApiRequest = useCallback(async (apiUrl, successMessage, onSuccess = () => {}) => {
        if (!token) {
            alert('Токен не найден.');
            return;
        }

        try {
            await axios.patch(apiUrl, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });
            alert(successMessage);
            onSuccess();
            fetchRequest();
        } catch (error) {
            console.error(`Ошибка при запросе ${apiUrl}:`, error);
            alert('Произошла ошибка при выполнении операции.');
        }
    }, [token, fetchRequest]);

    // Обработчик для показа формы процесса с установкой текущего значения
    const handleShowProcessForm = useCallback(() => {
        if (!showProcessForm && request) {
            setProcessInput(request.process || '');
        }
        setShowProcessForm(!showProcessForm);
        setShowStatusForm(false);
        setShowReplyForm(false);
    }, [showProcessForm, request]);

    // Обработчик для показа формы статуса с установкой текущего значения
    const handleShowStatusForm = useCallback(() => {
        if (!showStatusForm && request) {
            setStatusSelect(request.status?.toLowerCase() || '');
        }
        setShowStatusForm(!showStatusForm);
        setShowProcessForm(false);
        setShowReplyForm(false);
    }, [showStatusForm, request]);

    // Обработчик для показа формы ответа
    const handleShowReplyForm = useCallback(() => {
        setShowReplyForm(!showReplyForm);
        setShowProcessForm(false);
        setShowStatusForm(false);
    }, [showReplyForm]);

    // Функции для API-запросов
    const sendMessage = useCallback(async () => {
        if (!token || !request || !replyMessage.trim()) {
            alert('Токен, данные запроса или сообщение не указаны.');
            return;
        }

        try {
            await axios.post(`${URL}/api/Supports/send-message`, {
                telegramId: request.userTelegramId,
                message: replyMessage
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*',
                    'Content-Type': 'application/json-patch+json'
                }
            });
            alert('Сообщение отправлено пользователю.');
            setReplyMessage('');
            setShowReplyForm(false);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            alert('Ошибка при отправке сообщения.');
        }
    }, [token, request, replyMessage]);

    const takeInWork = useCallback(() => {
        if (!userId) {
            alert('UserId не найден.');
            return;
        }
        handleApiRequest(
            `${URL}/api/Supports/take-appeal?id=${id}&helper=${userId}`,
            'Запрос взят в работу.'
        );
    }, [id, userId, handleApiRequest]);

    const changeHelper = useCallback(() => {
        if (!telegramId) {
            alert('telegramId не найден.');
            return;
        }
        handleApiRequest(
            `${URL}/api/Supports/change-helper?id=${id}&helper=${telegramId}`,
            'Вы стали ответственным за запрос.'
        );
    }, [id, telegramId, handleApiRequest]);

    const changeProcess = useCallback(() => {
        if (!processInput.trim()) {
            alert('Процесс не указан.');
            return;
        }
        handleApiRequest(
            `${URL}/api/Supports/change-process?id=${id}&process=${encodeURIComponent(processInput)}`,
            'Процесс обновлен.',
            () => {
                setProcessInput('');
                setShowProcessForm(false);
            }
        );
    }, [id, processInput, handleApiRequest]);

    const changeStatus = useCallback(() => {
        if (!statusSelect) {
            alert('Статус не выбран.');
            return;
        }
        handleApiRequest(
            `${URL}/api/Supports/change-status?id=${id}&newStatus=${encodeURIComponent(statusSelect)}`,
            'Статус обновлен.',
            () => {
                setStatusSelect('');
                setShowStatusForm(false);
            }
        );
    }, [id, statusSelect, handleApiRequest]);

    // Функция для получения цвета статуса
    const getStatusColor = useCallback((status) => {
        if (!status) return 'secondary';

        const statusLower = status.toLowerCase();
        if (statusLower === 'новый' || statusLower === 'новое') {
            return 'primary';
        } else if (statusLower === 'в работе') {
            return 'warning';
        } else if (statusLower === 'завершено' || statusLower === 'выполнено' || statusLower === 'закрыто') {
            return 'success';
        }
        return 'secondary';
    }, []);

    if (loading) {
        return <div className="container mt-4">Загрузка данных запроса...</div>;
    }

    if (error) {
        return <div className="container mt-4 text-danger">{error}</div>;
    }

    if (!request) {
        return <div className="container mt-4">Запрос не найден</div>;
    }

    return (
        <div className="container mt-4">
            <h2>🔎 Детали запроса</h2>
            <div className="card mt-4 shadow-sm">
                <div className="card-header bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Пользователь: {request.userFirstName}</h5>
                        <span className={`badge bg-${getStatusColor(request.status)}`}>{request.status}</span>
                    </div>
                </div>
                <div className="card-body">
                    <div className="p-3 bg-light rounded mb-4" style={{ border: '1px solid #eee' }}>
                        <p className="card-text mb-0"><strong>Сообщение:</strong></p>
                        <p className="card-text">{request.message}</p>
                    </div>

                    <div className="row mb-2">
                        <div className="col-md-6">
                            <p className="card-text"><strong>Процесс:</strong> {request.process || 'Не указан'}</p>
                        </div>
                        <div className="col-md-6">
                            {request.helperName && (
                                <p className="card-text"><strong>Хелпер:</strong> {request.helperName}</p>
                            )}
                        </div>
                    </div>

                    {/* Основные кнопки действий */}
                    <div className="d-flex flex-wrap gap-2 mt-3">
                        {!request.helper ? (
                            <button className="btn btn-primary" onClick={takeInWork}>Взять в работу</button>
                        ) : (
                            <button className="btn btn-warning" onClick={changeHelper}>Перехватить</button>
                        )}

                        <button
                            className={`btn ${showProcessForm ? 'btn-secondary' : 'btn-success'}`}
                            onClick={handleShowProcessForm}
                        >
                            {showProcessForm ? 'Отмена' : 'Изменить процесс'}
                        </button>

                        <button
                            className={`btn ${showStatusForm ? 'btn-secondary' : 'btn-success'}`}
                            onClick={handleShowStatusForm}
                        >
                            {showStatusForm ? 'Отмена' : 'Изменить статус'}
                        </button>

                        <button
                            className={`btn ${showReplyForm ? 'btn-secondary' : 'btn-info'}`}
                            onClick={handleShowReplyForm}
                        >
                            {showReplyForm ? 'Отмена' : 'Ответить пользователю'}
                        </button>
                    </div>

                    {/* Выдвигающиеся формы */}
                    <div className="mt-4">
                        {/* Форма изменения процесса */}
                        {showProcessForm && (
                            <div className="card-body border rounded p-3 mb-3 bg-light">
                                <label className="form-label">
                                    <strong>Изменить процесс:</strong>
                                    <div className="text-muted small">Текущий: {request.process || 'Не указан'}</div>
                                </label>
                                <input
                                    type="text"
                                    className="form-control mb-2"
                                    value={processInput}
                                    onChange={(e) => setProcessInput(e.target.value)}
                                    placeholder="Введите описание процесса"
                                />
                                <button className="btn btn-success" onClick={changeProcess}>Обновить процесс</button>
                            </div>
                        )}

                        {/* Форма изменения статуса */}
                        {showStatusForm && (
                            <div className="card-body border rounded p-3 mb-3 bg-light">
                                <label className="form-label">
                                    <strong>Изменить статус:</strong>
                                    <div className="text-muted small">
                                        Текущий: <span className={`badge bg-${getStatusColor(request.status)}`}>{request.status}</span>
                                    </div>
                                </label>
                                <select
                                    className="form-select mb-2"
                                    value={statusSelect}
                                    onChange={(e) => setStatusSelect(e.target.value)}
                                >
                                    <option value="">Выберите статус</option>
                                    <option value="новый">Новый</option>
                                    <option value="в работе">В работе</option>
                                    <option value="завершено">Завершено</option>
                                </select>
                                <button className="btn btn-success" onClick={changeStatus}>Обновить статус</button>
                            </div>
                        )}

                        {/* Форма отправки ответа */}
                        {showReplyForm && (
                            <div className="card-body border rounded p-3 mb-3 bg-light">
                                <label className="form-label"><strong>Ответ пользователю:</strong></label>
                                <textarea
                                    className="form-control mb-2"
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Введите ваш ответ"
                                    rows="3"
                                />
                                <button className="btn btn-info" onClick={sendMessage}>Отправить ответ</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SupportDetail;

