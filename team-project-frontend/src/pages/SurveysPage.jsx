import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { surveysAPI } from "../api/api";
import "../styles/SurveysPage.css";

export default function SurveysPage() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await surveysAPI.getAll();
        if (!response.ok) throw new Error("Не вдалось завантажити опитування");
        const data = await response.json();
        setSurveys(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  if (loading) return <div className="surveys-status">Завантаження...</div>;
  if (error) return <div className="surveys-status surveys-status--error">{error}</div>;

  return (
    <div className="surveys-wrapper">
      <h1 className="surveys-title">Опитування</h1>
      {surveys.length === 0 ? (
        <p className="surveys-empty">Немає доступних опитувань</p>
      ) : (
        <div className="surveys-list">
          {surveys.map((survey) => (
            <div key={survey.id} className="survey-card">
              <h2 className="survey-card__title">{survey.title}</h2>
              <p className="survey-card__desc">{survey.description}</p>
              <div className="survey-card__actions">
                <button
                  className="survey-card__btn"
                  onClick={() => navigate(`/surveys/${survey.id}/results`)}
                >
                  Результати
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}