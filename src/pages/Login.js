import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [key, setKey] = useState('');
    const [telegramId, setTelegramId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await axios.post('https://localhost:7137/api/Users/api/auth/validate-key', {
                key,
                telegramId,
            });

            const token = response.data; // предполагаю, что сервер вернёт { token: "..." }

            if (token) {
                localStorage.setItem('token', token); // Сохраняем токен в localStorage
                localStorage.setItem('telegramId', telegramId); // Сохраняем Telegram ID в localStorage
                setSuccess('Успешный вход! Перенаправляем...');
                setTimeout(() => {
                    navigate('/home');
                }, 1000); // через 1 секунду
            } else {
                setError('Не удалось получить токен.');
            }
        } catch (err) {
            console.error(err);
            setError('Ошибка входа. Проверьте данные.');
        }
    };

    return (
        <Container className="mt-5" style={{ maxWidth: '400px' }}>
            <h2 className="mb-4">Вход</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formKey">
                    <Form.Label>Ключ</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Введите ключ"
                        value={key}
                        onChange={(e) => setKey(e.target.value)}
                        required
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formTelegramId">
                    <Form.Label>Telegram ID</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Введите Telegram ID"
                        value={telegramId}
                        onChange={(e) => setTelegramId(e.target.value)}
                        required
                    />
                </Form.Group>

                <Button variant="primary" type="submit">
                    Войти
                </Button>
            </Form>
        </Container>
    );
}

export default Login;
