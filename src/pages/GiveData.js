import React, { useState } from 'react';
import axios from 'axios';

function GiveData() {
    const [accurate, setAccurate] = useState(true); // состояние тумблера

    const handleDownload = async () => {
        const token = localStorage.getItem('token'); // получаем токен

        if (!token) {
            alert('Токен не найден. Пожалуйста, выполните вход.');
            return;
        }

        try {
            const response = await axios.get(`https://localhost:7137/api/Analytics/generate-report?accurate=${accurate}`, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'AnalyticsReport.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            alert('Отчет успешно загружен!');
        } catch (error) {
            console.error('Ошибка при скачивании отчета:', error);
            alert('Не удалось скачать отчет.');
        }
    };

    const handleToggle = () => {
        setAccurate(prev => !prev); // переключаем accurate
    };

    return (
        <div className="container mt-4 text-center">
            <h2>📊 Скачать отчет</h2>

            <div className="form-check form-switch my-4">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id="accurateSwitch"
                    checked={accurate}
                    onChange={handleToggle}
                />
                <label className="form-check-label" htmlFor="accurateSwitch">
                    Точность: {accurate ? 'Включена (true)' : 'Выключена (false)'}
                </label>
            </div>

            <button className="btn btn-primary mt-3" onClick={handleDownload}>
                Скачать отчет
            </button>
        </div>
    );
}

export default GiveData;
