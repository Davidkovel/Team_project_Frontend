import React from "react";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../api/api";

import { ResultBars } from "../components/ResultsBar";
import {Spinner, Alert} from "../components/Helpers";

import "../styles/ResultsPage.css";

export default function ResultsPage() {
  const [data, setData] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();

  const navigate = useNavigate();
 
  useEffect(() => {
    Promise.all([api.surveys.results(id), api.surveys.getById(id)])
      .then(([res, s]) => { setData(res); setSurvey(s); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [id]);
 
  if (loading) return <div className="centered"><Spinner /></div>;
  if (error)   return <div className="page"><Alert msg={error} /></div>;
 
  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate("/")}>← До опитувань</button>
      <h1>{survey?.title}</h1>
      <p className="meta" style={{ marginBottom: 24 }}>{survey?.description}</p>
 
      {(Array.isArray(data) ? data : []).map((q, i) => (
        <div key={q.id} className="card-flat" style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 16 }}>
            <span className="meta">Питання {i + 1} — </span>{q.text}
          </h3>
          <ResultBars question={q} />
        </div>
      ))}
 
      {(!data || data.length === 0) && (
        <div className="centered">
          <div style={{ fontSize: 48 }}>📊</div>
          <p className="meta" style={{ marginTop: 12 }}>Голосів поки немає</p>
        </div>
      )}
    </div>
  );
}