import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { decodeToken } from '../components/jwtUtils'; // правильный импорт

function SupportDetail() {
    const { id } = useParams();
    const [request, setRequest] = useState(null);
    const [processInput, setProcessInput] = useState('');
    const [statusSelect, setStatusSelect] = useState('');
    const [replyMessage, setReplyMessage] = useState(''); // 🆕 Добавлено состояние для ответа

    const fetchRequest = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Токен не найден.');
            return;
        }

        try {
            const response = await axios.get(`https://localhost:7137/api/Supports`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            const found = response.data.find(r => r.id === id);
            if (found) {
                let userFirstName = '';
                try {
                    const userResponse = await axios.get(`https://localhost:7137/api/Users/${found.userTelegramId}`, {
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
                    const helperResponse = await axios.get(`https://localhost:7137/api/Users/${found.helper}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Accept': '*/*'
                        }
                    });
                    setRequest(prevRequest => ({
                        ...prevRequest,
                        helperName: helperResponse.data.realFirstName
                    }));
                }
            } else {
                alert('Запрос не найден.');
            }
        } catch (error) {
            console.error('Ошибка при получении запроса:', error);
            console.log('Декодированный токен:', decodeToken(token));
            alert('Ошибка при загрузке данных запроса.');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            const decoded = decodeToken(token);
            console.log('Расшифрованный токен при заходе на страницу:', decoded);
        } else {
            console.warn('Токен не найден при заходе на страницу.');
        }

        fetchRequest();
    }, [id]);

    const sendMessage = async () => {
        const token = localStorage.getItem('token');

        if (!token || !request) {
            alert('Токен или данные запроса не найдены.');
            return;
        }

        try {
            await axios.post('https://localhost:7137/api/Supports/send-message', {
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
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            console.log('Декодированный токен:', decodeToken(token));
            alert('Ошибка при отправке сообщения.');
        }
    };
    const takeInWork = async () => {
        const token = localStorage.getItem('token');
        const payload = decodeToken(token);

        if (!token || !payload?.UserId) {
            alert('Токен или UserId не найден.');
            return;
        }

        const helperId = payload.UserId;

        try {
            await axios.patch(`https://localhost:7137/api/Supports/take-appeal?id=${id}&helper=${helperId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });
            alert('Запрос взят в работу.');
            fetchRequest();
        } catch (error) {
            console.error('Ошибка при взятии запроса в работу:', error);
            console.log('Декодированный токен:', decodeToken(token));
            alert('Ошибка при взятии запроса.');
        }
    };

    const changeHelper = async () => {
        const token = localStorage.getItem('token');
        const helperId = localStorage.getItem('telegramId');

        if (!token || !helperId) {
            alert('Токен или telegramId не найден.');
            return;
        }

        try {
            await axios.patch(`https://localhost:7137/api/Supports/change-helper?id=${id}&helper=${helperId}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });
            alert('Вы стали ответственным за запрос.');
            fetchRequest();
        } catch (error) {
            console.error('Ошибка при смене хелпера:', error);
            console.log('Декодированный токен:', decodeToken(token));
            alert('Ошибка при смене хелпера.');
        }
    };

    const changeProcess = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Токен не найден.');
            return;
        }

        try {
            await axios.patch(`https://localhost:7137/api/Supports/change-process?id=${id}&process=${encodeURIComponent(processInput)}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });
            alert('Процесс обновлен.');
            setProcessInput('');
            fetchRequest();
        } catch (error) {
            console.error('Ошибка при обновлении процесса:', error);
            console.log('Декодированный токен:', decodeToken(token));
            alert('Ошибка при обновлении процесса.');
        }
    };

    const changeStatus = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Токен не найден.');
            return;
        }

        try {
            await axios.patch(`https://localhost:7137/api/Supports/change-status?id=${id}&newStatus=${encodeURIComponent(statusSelect)}`, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });
            alert('Статус обновлен.');
            setStatusSelect('');
            fetchRequest();
        } catch (error) {
            console.error('Ошибка при обновлении статуса:', error);
            console.log('Декодированный токен:', decodeToken(token));
            alert('Ошибка при обновлении статуса.');
        }
    };

    if (!request) {
        return <div className="container mt-4">Загрузка...</div>;
    }

    return (
        <div className="container mt-4">
            <h2>🔎 Детали запроса</h2>
            <div className="card mt-4 shadow-sm">
                <div className="card-body">
                    <h5 className="card-title">Пользователь: {request.userFirstName}</h5>
                    <p className="card-text"><strong>Сообщение:</strong> {request.message}</p>
                    <p className="card-text"><strong>Статус:</strong> {request.status}</p>
                    <p className="card-text"><strong>Процесс:</strong> {request.process}</p>
                    {request.helperName && (
                        <p className="card-text"><strong>Хелпер:</strong> {request.helperName}</p>
                    )}

                    {/* Кнопки действий */}
                    <div className="mt-3">
                        {!request.helper ? (
                            <button className="btn btn-primary me-2" onClick={takeInWork}>Взять в работу</button>
                        ) : (
                            <button className="btn btn-warning me-2" onClick={changeHelper}>Перехватить</button>
                        )}
                    </div>

                    {/* Изменение процесса */}
                    <div className="mt-4">
                        <label className="form-label"><strong>Изменить процесс:</strong></label>
                        <input
                            type="text"
                            className="form-control mb-2"
                            value={processInput}
                            onChange={(e) => setProcessInput(e.target.value)}
                        />
                        <button className="btn btn-success" onClick={changeProcess}>Обновить процесс</button>
                    </div>

                    {/* Изменение статуса */}
                    <div className="mt-4">
                        <label className="form-label"><strong>Изменить статус:</strong></label>
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

                    {/* 🆕 Блок для отправки ответа пользователю */}
                    <div className="mt-4">
                        <label className="form-label"><strong>Ответ пользователю:</strong></label>
                        <input
                            type="text"
                            className="form-control mb-2"
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                        />
                        <button className="btn btn-info" onClick={sendMessage}>Отправить ответ</button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default SupportDetail;
