import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { URL } from '../domain.ts';

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
                const response = await axios.get(URL+'/api/Supports', {
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
                        const userResponse = await axios.get(`${URL}/api/Users/${req.userTelegramId}`, {
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

    // Функция для нормализации статуса (приведение к единому виду)
    const normalizeStatus = (status) => {
        if (!status) return '';

        // Приводим к нижнему регистру для сравнения
        const statusLower = status.toLowerCase();

        if (statusLower === 'новое' || statusLower === 'новый') {
            return 'новое';
        } else if (statusLower === 'в работе') {
            return 'в работе';
        } else if (statusLower === 'завершено' || statusLower === 'выполнено' || statusLower === 'закрыто') {
            return 'завершено';
        }

        return statusLower; // Возвращаем как есть, но в нижнем регистре
    };

    // Функция для отображения красивого форматированного статуса
    const getFormattedStatus = (rawStatus) => {
        const status = normalizeStatus(rawStatus);

        switch (status) {
            case 'новое':
                return 'Новое';
            case 'в работе':
                return 'В работе';
            case 'завершено':
                return 'Завершено';
            default:
                // Если неизвестный статус, делаем первую букву заглавной
                return status.charAt(0).toUpperCase() + status.slice(1);
        }
    };

    const getStatusBadge = (rawStatus) => {
        const status = normalizeStatus(rawStatus);

        switch (status) {
            case 'новое':
                return <span className="badge bg-primary ms-2">Новое</span>;
            case 'в работе':
                return <span className="badge bg-warning text-dark ms-2">В работе</span>;
            case 'завершено':
                return <span className="badge bg-success ms-2">Завершено</span>;
            default:
                return <span className="badge bg-secondary ms-2">{getFormattedStatus(status) || 'Неизвестно'}</span>;
        }
    };

    // Получение стиля для элемента списка в зависимости от статуса
    const getItemStyle = (rawStatus) => {
        const status = normalizeStatus(rawStatus);

        const baseStyle = {
            cursor: 'pointer',
            borderLeft: '5px solid',
            transition: 'all 0.2s ease',
            marginBottom: '8px', // Добавляем отступ снизу
        };

        switch (status) {
            case 'новое':
                return {
                    ...baseStyle,
                    borderLeftColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.05)',
                };
            case 'в работе':
                return {
                    ...baseStyle,
                    borderLeftColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.05)',
                };
            case 'завершено':
                return {
                    ...baseStyle,
                    borderLeftColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.05)',
                };
            default:
                return {
                    ...baseStyle,
                    borderLeftColor: '#6c757d',
                    backgroundColor: 'rgba(108, 117, 125, 0.05)',
                };
        }
    };

    const handleOpenRequest = (id) => {
        navigate(`/support/${id}`);
    };

    // Собственные стили для изменения расстояний в списке
    const listGroupStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px' // Расстояние между элементами списка
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">🛠️ Список обращений</h2>

            {requests.length === 0 ? (
                <p>Нет обращений.</p>
            ) : (
                <ul className="list-group" style={listGroupStyle}>
                    {requests.map((req) => (
                        <li
                            key={req.id}
                            className="list-group-item d-flex justify-content-between align-items-center"
                            style={getItemStyle(req.status)}
                            onClick={() => handleOpenRequest(req.id)}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                            }}
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

