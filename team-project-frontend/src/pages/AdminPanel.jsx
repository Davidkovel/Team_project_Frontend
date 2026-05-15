// src/pages/AdminPanel.jsx

import React, { useState } from "react";
import "../styles/AdminPanel.css";

function AdminPanel() {
    const [activePage, setActivePage] = useState("dashboard");

    const renderContent = () => {
        switch (activePage) {
            case "dashboard":
                return (
                    <>
                        <h1 className="page-title">📊 Dashboard</h1>

                        <div className="cards">
                            <div className="card">
                                <h3>Опитування</h3>
                                <p>12</p>
                            </div>

                            <div className="card">
                                <h3>Користувачі</h3>
                                <p>248</p>
                            </div>

                            <div className="card">
                                <h3>Голоси</h3>
                                <p>1430</p>
                            </div>

                            <div className="card">
                                <h3>Активні</h3>
                                <p>5</p>
                            </div>
                        </div>

                        <div className="content-box">
                            <h2>Остання активність</h2>

                            <div className="activity">
                                <p>✅ Нове опитування створено</p>
                                <span>2 хв тому</span>
                            </div>

                            <div className="activity">
                                <p>👤 Новий користувач зареєстрований</p>
                                <span>10 хв тому</span>
                            </div>

                            <div className="activity">
                                <p>📈 Оновлено результати</p>
                                <span>30 хв тому</span>
                            </div>
                        </div>
                    </>
                );

            case "surveys":
                return (
                    <>
                        <div className="top-bar">
                            <h1 className="page-title">🗳 Опитування</h1>

                            <button className="main-btn">
                                + Створити
                            </button>
                        </div>

                        <div className="table-box">
                            <table>
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Назва</th>
                                    <th>Статус</th>
                                    <th>Голоси</th>
                                    <th>Дії</th>
                                </tr>
                                </thead>

                                <tbody>
                                <tr>
                                    <td>1</td>
                                    <td>Улюблена мова</td>
                                    <td>
                      <span className="status active">
                        Активне
                      </span>
                                    </td>
                                    <td>120</td>
                                    <td>
                                        <button className="edit-btn">
                                            Edit
                                        </button>

                                        <button className="delete-btn">
                                            Delete
                                        </button>
                                    </td>
                                </tr>

                                <tr>
                                    <td>2</td>
                                    <td>Найкращий фреймворк</td>
                                    <td>
                      <span className="status ended">
                        Завершене
                      </span>
                                    </td>
                                    <td>87</td>
                                    <td>
                                        <button className="edit-btn">
                                            Edit
                                        </button>

                                        <button className="delete-btn">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                );

            case "users":
                return (
                    <>
                        <h1 className="page-title">👤 Користувачі</h1>

                        <div className="users-grid">
                            <div className="user-card">
                                <div className="avatar">A</div>

                                <h3>admin@gmail.com</h3>

                                <p>Адміністратор</p>

                                <button className="main-btn">
                                    Профіль
                                </button>
                            </div>

                            <div className="user-card">
                                <div className="avatar">U</div>

                                <h3>user@gmail.com</h3>

                                <p>Користувач</p>

                                <button className="main-btn">
                                    Профіль
                                </button>
                            </div>

                            <div className="user-card">
                                <div className="avatar">T</div>

                                <h3>test@gmail.com</h3>

                                <p>Користувачь</p>

                                <button className="main-btn">
                                    Профіль
                                </button>
                            </div>
                        </div>
                    </>
                );

            case "results":
                return (
                    <>
                        <h1 className="page-title">📈 Результати</h1>

                        <div className="results-grid">
                            <div className="result-card">
                                <h3>React</h3>

                                <div className="progress">
                                    <div
                                        className="progress-fill"
                                        style={{ width: "70%" }}
                                    ></div>
                                </div>

                                <p>70%</p>
                            </div>

                            <div className="result-card">
                                <h3>Vue</h3>

                                <div className="progress">
                                    <div
                                        className="progress-fill"
                                        style={{ width: "40%" }}
                                    ></div>
                                </div>

                                <p>40%</p>
                            </div>

                            <div className="result-card">
                                <h3>Angular</h3>

                                <div className="progress">
                                    <div
                                        className="progress-fill"
                                        style={{ width: "20%" }}
                                    ></div>
                                </div>

                                <p>20%</p>
                            </div>
                        </div>
                    </>
                );

            case "settings":
                return (
                    <>
                        <h1 className="page-title"> Налаштування</h1>

                        <div className="settings-box">
                            <div className="setting-item">
                                <label>Тема</label>

                                <select>
                                    <option>темна</option>
                                    <option>світла</option>
                                </select>
                            </div>

                            <div className="setting-item">
                                <label>Мова</label>

                                <select>
                                    <option>Українська</option>
                                    <option>English</option>
                                </select>
                            </div>

                            <button className="save-btn">
                                Зберегти
                            </button>
                        </div>
                    </>
                );

            default:
                return <h1>Dashboard</h1>;
        }
    };

    return (
        <div className="admin-panel">
            {/* Sidebar */}
            <aside className="sidebar">
                <div>
                    <h2 className="logo">Admin Panel</h2>

                    <ul className="menu">
                        <li
                            onClick={() => setActivePage("dashboard")}
                        >
                            📊 Dashboard
                        </li>

                        <li
                            onClick={() => setActivePage("surveys")}
                        >
                            🗳 Опитування
                        </li>

                        <li
                            onClick={() => setActivePage("users")}
                        >
                            👤 Користувачі
                        </li>

                        <li
                            onClick={() => setActivePage("results")}
                        >
                            📈 Результати
                        </li>

                        <li
                            onClick={() => setActivePage("settings")}
                        >
                            ⚙ Налаштування
                        </li>
                    </ul>
                </div>

                <button className="logout-btn">
                    Вийти
                </button>
            </aside>

            {/* Main */}
            <main className="content">
                {renderContent()}
            </main>
        </div>
    );
}

export default AdminPanel;