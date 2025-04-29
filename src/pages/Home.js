import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Функции декодирования и проверки токена
export function decodeToken(token) {
    if (!token) return null;

    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch (error) {
        console.error('Ошибка при декодировании токена:', error);
        return null;
    }
}

export const isTokenExpired = (token) => {
    if (!token) return true;

    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const expirationDate = decoded.exp * 1000;
    return Date.now() > expirationDate;
};

function Home() {
    const [role, setRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token'); // убедитесь, что ключ правильный
        if (token && !isTokenExpired(token)) {
            const decoded = decodeToken(token);
            setRole(decoded?.role || null); // предполагается, что роль хранится в поле "role"
        }
    }, []);

    // Функции рендеринга карточек
    const renderSupportCard = () => (
        <div className="col-lg-4">
            <Link to="/support" className="card text-center shadow border-0 p-4 text-decoration-none">
                <div className="mb-3">
                    <i className="bi bi-journal-text fs-1 text-primary"></i>
                </div>
                <h4 className="text-dark">Support</h4>
                <p className="text-muted">Просмотрите и управляйте всеми заявками.</p>
            </Link>
        </div>
    );

    const renderCreateCourseCard = () => (
        <div className="col-lg-4">
            <Link to="/createcourse" className="card text-center shadow border-0 p-4 text-decoration-none">
                <div className="mb-3">
                    <i className="bi bi-plus-square fs-1 text-success"></i>
                </div>
                <h4 className="text-dark">Создать курс</h4>
                <p className="text-muted">Добавьте новый курс в систему с помощью простой формы.</p>
            </Link>
        </div>
    );

    const renderAnalyticsCard = () => (
        <div className="col-lg-4">
            <Link to="/givedata" className="card text-center shadow border-0 p-4 text-decoration-none">
                <div className="mb-3">
                    <i className="bi bi-bar-chart-line fs-1 text-danger"></i>
                </div>
                <h4 className="text-dark">Аналитика</h4>
                <p className="text-muted">Получите аналитику по курсам и активности пользователей.</p>
            </Link>
        </div>
    );

    return (
        <section id="dashboard-options" className="py-5 bg-light">
            <div className="container">
                <h2 className="text-center mb-5">Панель администратора</h2>
                <div className="row g-4">
                    {renderSupportCard()}
                    {role !== 'analyst' && renderCreateCourseCard()}
                    {renderAnalyticsCard()}
                </div>
            </div>
        </section>
    );
}

export default Home;
