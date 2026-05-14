import React, { useState } from 'react';

const questions = [
    { id: 1, text: "Оберіть основну технологію проекту:", options: ["React + C#", "Angular + Java", "Vue + Python"] },
    { id: 2, text: "Чи реалізована база даних?", options: ["Так", "В процесі", "Ні"] },
    { id: 3, text: "Який рівень складності курсової?", options: ["Низький", "Середній", "Високий"] },
];

export default function SurveyPage() {
    const [step, setStep] = useState(0);
    const [results, setResults] = useState({});

    const handleSelect = (option) => {
        setResults({ ...results, [questions[step].id]: option });
    };

    return (
        <div className="survey-container">
            <div className="card">
                <h3>Питання {step + 1} з {questions.length}</h3>
                <p className="question-text">{questions[step].text}</p>

                <div className="options-list">
                    {questions[step].options.map(opt => (
                        <button
                            key={opt}
                            className={`opt-btn ${results[questions[step].id] === opt ? 'active' : ''}`}
                            onClick={() => handleSelect(opt)}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                <div className="nav-bar">
                    <button disabled={step === 0} onClick={() => setStep(step - 1)}>Назад</button>
                    {step < questions.length - 1 ? (
                        <button onClick={() => setStep(step + 1)}>Вперед</button>
                    ) : (
                        <button className="confirm-btn" onClick={() => alert('Вибір підтверджено!')}>Підтвердити</button>
                    )}
                </div>
            </div>
        </div>
    );
}