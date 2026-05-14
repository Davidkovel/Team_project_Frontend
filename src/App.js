import React, { useState } from 'react';
import './App.css';
import SurveyPage from './components/SurveyPage';
import UserManagement from './components/UserManagement';

function App() {
    const [currentPage, setCurrentPage] = useState('survey');

    return (
        <div className="App">
            <header style={{ background: '#282c34', padding: '20px', color: 'white' }}>
                <h1>Панель курсової роботи</h1>
                {/* Просте та надійне меню */}
                <nav style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button
                        onClick={() => setCurrentPage('survey')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: currentPage === 'survey' ? '#4CAF50' : '#fff',
                            color: currentPage === 'survey' ? '#white' : '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Пройти опитування
                    </button>
                    <button
                        onClick={() => setCurrentPage('admin')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: currentPage === 'admin' ? '#4CAF50' : '#fff',
                            color: currentPage === 'admin' ? '#white' : '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Керування користувачами
                    </button>
                </nav>
            </header>

            <main style={{ padding: '20px' }}>
                {/* Рендеримо потрібну сторінку залежно від стану */}
                {currentPage === 'survey' ? <SurveyPage /> : <UserManagement />}
            </main>
        </div>
    );
}

export default App;
