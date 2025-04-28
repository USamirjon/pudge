import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Support() {
    const [requests, setRequests] = useState([]);
    const [userNames, setUserNames] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                alert('Токен не найден. Выполните вход.');
                return;
            }

            try {
                const response = await axios.get('https://localhost:7137/api/Supports', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': '*/*'
                    }
                });

                const supports = response.data;
                setRequests(supports);

                // Параллельно загружаем реальные имена пользователей
                const userNamePromises = supports.map(async (req) => {
                    try {
                        const userResponse = await axios.get(`https://localhost:7137/api/Users/${req.userTelegramId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Accept': '*/*'
                            }
                        });
                        return { telegramId: req.userTelegramId, realFirstName: userResponse.data.realFirstName };
                    } catch (error) {
                        console.error(`Ошибка при загрузке данных пользователя ${req.userTelegramId}:`, error);
                        return { telegramId: req.userTelegramId, realFirstName: 'Неизвестно' };
                    }
                });

                const users = await Promise.all(userNamePromises);

                // Создаем объект { telegramId: realFirstName }
                const userMap = {};
                users.forEach(u => {
                    userMap[u.telegramId] = u.realFirstName;
                });
                setUserNames(userMap);

            } catch (error) {
                console.error('Ошибка при загрузке обращений:', error);
                alert('Ошибка при загрузке обращений.');
            }
        };

        fetchRequests();
    }, []);

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Новое':
                return <span className="badge bg-primary ms-2">Новое</span>;
            case 'В работе':
                return <span className="badge bg-warning text-dark ms-2">В работе</span>;
            case 'Завершено':
                return <span className="badge bg-success ms-2">Завершено</span>;
            default:
                return <span className="badge bg-secondary ms-2">{status || 'Неизвестно'}</span>;
        }
    };

    const handleOpenRequest = (id) => {
        navigate(`/support/${id}`);
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">🛠️ Список обращений</h2>

            {requests.length === 0 ? (
                <p>Нет обращений.</p>
            ) : (
                <ul className="list-group">
                    {requests.map((req) => (
                        <li
                            key={req.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleOpenRequest(req.id)}
                        >
                            <div>
                                <strong>Пользователь:</strong> {userNames[req.userTelegramId] || req.userTelegramId}<br/>
                                <small className="text-muted">
                                    {req.message.length > 50 ? req.message.substring(0, 50) + '...' : req.message}
                                </small>
                            </div>
                            {getStatusBadge(req.status)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Support;
