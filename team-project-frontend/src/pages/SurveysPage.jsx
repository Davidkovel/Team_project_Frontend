
import React from "react";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { surveysAPI } from "../api/api";

import api from "../api/api";

import { useAuth } from "../context/AuthContext";

import {Spinner, Alert, StatusBadge, isSurveyVoteable} from "../components/Helpers";
import QuestionTimer from "../components/Timer";

import "../styles/SurveysPage.css";

function SurveysPage() {
  const { isAdmin, isLoggedIn } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
 
  const load = async () => {
    setLoading(true);
    try {
      const data = await api.surveys.getAll();
      // API may return array or { items } or { data }
      setSurveys(Array.isArray(data) ? data : data.items || data.data || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
 
  useEffect(() => { load(); }, []);
 
  const handleDelete = async (id) => {
    if (!window.confirm("Видалити?")) return;
    try { await api.surveys.delete(id); load(); }
    catch (e) { alert(e.message); }
  };
 
  if (loading) return <div className="centered"><Spinner /></div>;
 
  return (
    <div className="page">
      <div className="flex between">
        <div>
          <h1>Опитування</h1>
          <p className="meta">{surveys.length} доступних голосувань</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => navigate("/surveys/create")}>
            + Нове опитування
          </button>
        )}
      </div>
 
      <Alert msg={error} />
 
      {surveys.length === 0 ? (
        <div className="centered">
          <div style={{ fontSize: 48 }}>🗳</div>
          <div style={{ marginTop: 12, fontSize: 16 }}>Опитувань поки немає</div>
          {isAdmin && <button className="btn btn-primary mt-16" onClick={() => navigate("/surveys/create")}>Створити перше</button>}
        </div>
      ) : (
        <div className="surveys-grid">
          {surveys.map(s => (
            <div key={s.id} className="card" style={{ cursor: "default" }}>
              <div className="flex between gap-8" style={{ marginBottom: 8 }}>
                <StatusBadge survey={s} />
                {s.allowRepeatVoting && <span className="tag">Повторне голос.</span>}
              </div>
              <h2 style={{ fontSize: 17, marginBottom: 6 }}>{s.title}</h2>
              <p className="meta" style={{ marginBottom: 4 }}>{s.description}</p>
              {s.endAt && (
                <p className="meta" style={{ fontSize: 12 }}>
                  ⏰ до {new Date(s.endAt).toLocaleDateString("uk-UA")}
                </p>
              )}
              <div className="survey-actions">
                {isLoggedIn && isSurveyVoteable(s) && (
                  <button className="btn btn-success btn-sm" onClick={() => navigate(`/surveys/${s.id}/vote`)}>
                    Голосувати
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/surveys/${s.id}/results`)}>
                  Результати
                </button>
                {isAdmin && (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/surveys/${s.id}/edit`)}>
                      ✏️
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                      🗑
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
 
// ─── CREATE / EDIT SURVEY PAGE ────────────────────────────────
function SurveyFormPage({ surveyId }) {
  const isEdit = !!surveyId;
  const [form, setForm] = useState({
    title: "", description: "", isPublished: false,
    allowRepeatVoting: false, startAt: "", endAt: "",
    questionTimeLimit: "", totalTimeLimit: "",
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedId, setSavedId] = useState(surveyId || null);

  const navigate = useNavigate();
 
  useEffect(() => {
    if (!isEdit) return;
    api.surveys.getById(surveyId).then(s => {
      setForm({
        title: s.title || "", description: s.description || "",
        isPublished: s.isPublished || false, allowRepeatVoting: s.allowRepeatVoting || false,
        startAt: s.startAt ? s.startAt.slice(0, 16) : "",
        endAt: s.endAt ? s.endAt.slice(0, 16) : "",
        questionTimeLimit: s.questionTimeLimit || "",
        totalTimeLimit: s.totalTimeLimit || "",
      });
      setQuestions(s.questions || []);
      setLoading(false);
    }).catch(e => { setError(e.message); setLoading(false); });
  }, [surveyId]);
 
  const saveSurvey = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const body = {
        ...form,
        startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
        endAt:   form.endAt   ? new Date(form.endAt).toISOString()   : null,
        questionTimeLimit: form.questionTimeLimit ? parseInt(form.questionTimeLimit) : null,
        totalTimeLimit:    form.totalTimeLimit    ? parseInt(form.totalTimeLimit)    : null,
      };
      if (savedId) {
        await api.surveys.update(savedId, body);
        setSuccess("Збережено!");
      } else {
        const s = await api.surveys.create(body);
        setSavedId(s.id);
        setSuccess("Опитування створено! Тепер додайте питання.");
      }
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
 
  const addQuestion = async () => {
    if (!savedId) { setError("Спочатку збережіть опитування"); return; }
    const text = prompt("Текст питання:");
    if (!text) return;
    const typeStr = prompt("Тип: 0=SingleChoice, 1=MultipleChoice, 2=Open", "0");
    try {
      const q = await api.surveys.addQuestion(savedId, {
        text, questionType: parseInt(typeStr || "0"), isRequired: true
      });
      setQuestions(prev => [...prev, { ...q, options: [] }]);
    } catch (e) { setError(e.message); }
  };
 
  const addOption = async (qid) => {
    const text = prompt("Текст варіанту:");
    if (!text) return;
    try {
      const o = await api.surveys.addOption(qid, { text });
      setQuestions(prev => prev.map(q => q.id === qid
        ? { ...q, options: [...(q.options || []), o] } : q
      ));
    } catch (e) { setError(e.message); }
  };
 
  if (loading) return <div className="centered"><Spinner /></div>;
 
  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
 
  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate("/")}>← Назад</button>
      <h1>{isEdit ? "Редагувати опитування" : "Нове опитування"}</h1>
 
      <Alert msg={error} />
      <Alert type="success" msg={success} />
 
      <div className="card-flat">
        <h3 style={{ marginBottom: 16 }}>Основна інформація</h3>
        <div className="field"><label>Назва *</label>
          <input value={form.title} onChange={f("title")} placeholder="Назва голосування" />
        </div>
        <div className="field"><label>Опис</label>
          <textarea value={form.description} onChange={f("description")} placeholder="Короткий опис..." />
        </div>
        <div className="field-row">
          <div className="field"><label>Дата початку</label>
            <input type="datetime-local" value={form.startAt} onChange={f("startAt")} />
          </div>
          <div className="field"><label>Дата закінчення</label>
            <input type="datetime-local" value={form.endAt} onChange={f("endAt")} />
          </div>
        </div>
        <div className="field-row">
          <div className="field"><label>Час на питання (сек)</label>
            <input type="number" value={form.questionTimeLimit} onChange={f("questionTimeLimit")} placeholder="Без ліміту" min="5" />
          </div>
          <div className="field"><label>Час на все (сек)</label>
            <input type="number" value={form.totalTimeLimit} onChange={f("totalTimeLimit")} placeholder="Без ліміту" min="30" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 15 }}>
            <input type="checkbox" checked={form.isPublished} onChange={f("isPublished")} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
            Опублікувати
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 15 }}>
            <input type="checkbox" checked={form.allowRepeatVoting} onChange={f("allowRepeatVoting")} style={{ width: 16, height: 16, accentColor: "var(--accent)" }} />
            Дозволити повторне голосування
          </label>
        </div>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={saveSurvey} disabled={saving || !form.title}>
            {saving ? <Spinner /> : (savedId ? "💾 Зберегти" : "➕ Створити")}
          </button>
          {savedId && <button className="btn btn-ghost" onClick={() => navigate(`/surveys/${savedId}/results`)}>Результати →</button>}
        </div>
      </div>
 
      {/* QUESTIONS */}
      {savedId && (
        <div style={{ marginTop: 24 }}>
          <div className="flex between">
            <h2>Питання ({questions.length})</h2>
            <button className="btn btn-secondary btn-sm" onClick={addQuestion}>+ Питання</button>
          </div>
 
          {questions.map((q, qi) => (
            <div key={q.id} className="card-flat" style={{ marginTop: 12 }}>
              <div className="flex between gap-8">
                <div>
                  <span className="meta">Питання {qi + 1}</span>
                  <div style={{ marginTop: 2 }}><strong>{q.text}</strong></div>
                  <span className="tag" style={{ marginTop: 4, display: "inline-block" }}>
                    {["SingleChoice","MultipleChoice","Open"][q.questionType ?? 0]}
                  </span>
                </div>
                {q.questionType !== 2 && (
                  <button className="btn btn-secondary btn-sm" onClick={() => addOption(q.id)}>
                    + Варіант
                  </button>
                )}
              </div>
              {(q.options || []).length > 0 && (
                <div style={{ marginTop: 12 }}>
                  {q.options.map((o, oi) => (
                    <div key={o.id || oi} style={{ padding: "6px 12px", background: "var(--surface)", borderRadius: 8, marginBottom: 6, fontSize: 14 }}>
                      {oi + 1}. {o.text}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
 
          {questions.length === 0 && (
            <div className="centered" style={{ padding: "24px" }}>
              <p className="meta">Додайте хоча б одне питання</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


function VotePage() {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> { optionId?, openAnswer? }
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [totalLeft, setTotalLeft] = useState(null);
  const { id } = useParams();

  const navigate = useNavigate();
 
  useEffect(() => {
    api.surveys.getById(id).then(s => {
      setSurvey(s);
      if (s.totalTimeLimit) setTotalLeft(s.totalTimeLimit);
      setLoading(false);
    }).catch(e => { setError(e.message); setLoading(false); });
  }, [id]);
 
  // Total timer
  useEffect(() => {
    if (!totalLeft) return;
    if (totalLeft <= 0) { handleSubmit(); return; }
    const id = setTimeout(() => setTotalLeft(l => l - 1), 1000);
    return () => clearTimeout(id);
  }, [totalLeft]);
 
  const questions = survey?.questions || [];
  const q = questions[current];
 
  const setAnswer = (qid, val) => setAnswers(prev => ({ ...prev, [qid]: val }));
 
  const handleOptionChange = (qid, optId, isMulti) => {
    if (isMulti) {
      const cur = answers[qid]?.optionIds || [];
      const next = cur.includes(optId) ? cur.filter(x => x !== optId) : [...cur, optId];
      setAnswer(qid, { optionIds: next });
    } else {
      setAnswer(qid, { optionId: optId });
    }
  };
 
  const handleSubmit = async () => {
    setSubmitting(true); setError("");
    try {
      // Vote per question (matches backend API)
      for (const q of questions) {
        const ans = answers[q.id];
        const isOpen = q.questionType === 2;
        if (!ans && !isOpen) continue;
 
        if (isOpen) {
          await api.surveys.vote(q.id, { openAnswer: ans?.openAnswer || "" });
        } else if (q.questionType === 1) {
          // multiple — send one vote per option
          const ids = ans?.optionIds || [];
          for (const oid of ids) {
            await api.surveys.vote(q.id, { optionId: oid });
          }
        } else {
          if (ans?.optionId) await api.surveys.vote(q.id, { optionId: ans.optionId });
        }
      }
      setSubmitted(true);
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };
 
  if (loading) return <div className="centered"><Spinner /></div>;
  if (error && !survey) return <div className="page"><Alert msg={error} /></div>;
 
  if (submitted) {
    return (
      <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
        <div style={{ fontSize: 64 }}>✅</div>
        <h1 style={{ marginTop: 16 }}>Ваш голос зараховано!</h1>
        <p className="meta" style={{ marginTop: 8 }}>Дякуємо за участь в опитуванні</p>
        <div className="btn-row" style={{ justifyContent: "center", marginTop: 24 }}>
          <button className="btn btn-primary" onClick={() => navigate(`/surveys/${id}/results`)}>Переглянути результати</button>
          <button className="btn btn-ghost" onClick={() => navigate("/")}>На головну</button>
        </div>
      </div>
    );
  }
 
  if (!questions.length) {
    return <div className="page"><Alert type="info" msg="У цьому опитуванні немає питань" /></div>;
  }
 
  const isMulti = q.questionType === 1;
  const isOpen  = q.questionType === 2;
  const ans = answers[q.id] || {};
  const done = questions.map((_q, i) => answers[_q.id] !== undefined);
 
  return (
    <div className="page">
      <div className="vote-header">
        <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate("/")}>← До опитувань</button>
        <div className="flex between gap-12" style={{ flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 22 }}>{survey.title}</h1>
          {totalLeft !== null && (
            <div className="timer-wrap" style={{ gap: 6 }}>
              <span>⏳</span>
              <span className={totalLeft <= 30 ? "timer-danger" : ""} style={{ fontWeight: 700 }}>
                {Math.floor(totalLeft / 60)}:{String(totalLeft % 60).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
        <div className="progress-dots">
          {questions.map((_q, i) => (
            <div key={i} className={`progress-dot ${i === current ? "current" : done[i] ? "done" : ""}`}
              onClick={() => setCurrent(i)} title={`Питання ${i + 1}`} />
          ))}
        </div>
        <div className="meta">Питання {current + 1} з {questions.length}</div>
      </div>
 
      <div className="question-card">
        {q.questionType !== 2 && survey.questionTimeLimit && (
          <QuestionTimer key={`${id}-${current}`} seconds={survey.questionTimeLimit}
            onExpire={() => current < questions.length - 1 && setCurrent(c => c + 1)} />
        )}
 
        <div className="question-num">Питання {current + 1}</div>
        <div className="question-text">{q.text}</div>
        {q.isRequired && <div className="meta" style={{ marginBottom: 8 }}>* Обов'язкове</div>}
 
        {isOpen ? (
          <textarea className="open-answer"
            placeholder="Введіть вашу відповідь..."
            value={ans.openAnswer || ""}
            onChange={e => setAnswer(q.id, { openAnswer: e.target.value })}
          />
        ) : (
          <div className="option-list">
            {(q.options || []).map(opt => {
              const checked = isMulti
                ? (ans.optionIds || []).includes(opt.id)
                : ans.optionId === opt.id;
              return (
                <label key={opt.id} className={`option-item ${checked ? "selected" : ""}`}>
                  <input type={isMulti ? "checkbox" : "radio"} checked={checked}
                    onChange={() => handleOptionChange(q.id, opt.id, isMulti)} />
                  <span className="option-text">{opt.text}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
 
      <Alert msg={error} />
 
      <div className="btn-row" style={{ marginTop: 20 }}>
        <button className="btn btn-secondary" onClick={() => setCurrent(c => c - 1)} disabled={current === 0}>
          ← Назад
        </button>
        {current < questions.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setCurrent(c => c + 1)}>
            Далі →
          </button>
        ) : (
          <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Spinner /> : "✓ Підтвердити відповіді"}
          </button>
        )}
      </div>
    </div>
  );
}

export { SurveysPage, SurveyFormPage, VotePage };