import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { surveysAPI } from "../api/api";
import "../styles/ResultsPage.css";

export default function ResultsPage() {
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await surveysAPI.getResults(id);
        if (!response.ok) throw new Error("Не вдалось завантажити результати");
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [id]);

  if (loading) return <div className="results-status">Завантаження...</div>;
  if (error) return <div className="results-status results-status--error">{error}</div>;
  if (!results) return null;

  return (
    <div className="results-wrapper">
      <h1 className="results-title">{results.title}</h1>
      <p className="results-total">Всього голосів: {results.totalVotes}</p>

      <div className="results-list">
        {results.questions?.map((question) => (
          <div key={question.id} className="result-question">
            <h2 className="result-question__text">{question.text}</h2>
            <div className="result-options">
              {question.options?.map((option) => {
                const percent =
                  results.totalVotes > 0
                    ? Math.round((option.votes / results.totalVotes) * 100)
                    : 0;
                return (
                  <div key={option.id} className="result-option">
                    <div className="result-option__header">
                      <span>{option.text}</span>
                      <span>{percent}% ({option.votes} голосів)</span>
                    </div>
                    <div className="result-option__bar-wrapper">
                      <div
                        className="result-option__bar"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}