import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <section id="dashboard-options" className="py-5 bg-light">
            <div className="container">
                <h2 className="text-center mb-5">Панель администратора</h2>
                <div className="row g-4">
                    <div className="col-lg-4">
                        <Link to="/courses" className="card text-center shadow border-0 p-4 text-decoration-none">
                            <div className="mb-3">
                                <i className="bi bi-journal-text fs-1 text-primary"></i>
                            </div>
                            <h4 className="text-dark">Все курсы</h4>
                            <p className="text-muted">Просмотрите и управляйте всеми доступными курсами.</p>
                        </Link>
                    </div>

                    <div className="col-lg-4">
                        <Link to="/createcourse" className="card text-center shadow border-0 p-4 text-decoration-none">
                            <div className="mb-3">
                                <i className="bi bi-plus-square fs-1 text-success"></i>
                            </div>
                            <h4 className="text-dark">Создать курс</h4>
                            <p className="text-muted">Добавьте новый курс в систему с помощью простой формы.</p>
                        </Link>
                    </div>

                    <div className="col-lg-4">
                        <Link to="/givedata" className="card text-center shadow border-0 p-4 text-decoration-none">
                            <div className="mb-3">
                                <i className="bi bi-bar-chart-line fs-1 text-danger"></i>
                            </div>
                            <h4 className="text-dark">Аналитика</h4>
                            <p className="text-muted">Получите аналитику по курсам и активности пользователей.</p>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Home;
