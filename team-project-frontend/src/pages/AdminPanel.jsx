import React, { useState } from "react";

import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import { Alert, Spinner, getSurveyStatus, isSurveyActive} from "../components/Helpers";


import "../styles/AdminPanel.css";

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.65)",
      backdropFilter: "blur(4px)", zIndex: 999,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <div style={{
        background: "#1a1f30", border: "1px solid #252b40",
        borderRadius: 16, padding: 28, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#7b82a8",
            cursor: "pointer", fontSize: 20, lineHeight: 1
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
 
// ─── INPUT helper ─────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: "#7b82a8", marginBottom: 5, textTransform: "uppercase", letterSpacing: ".3px" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
 
const inputStyle = {
  width: "100%", padding: "10px 12px",
  background: "#131726", border: "1px solid #252b40",
  borderRadius: 8, color: "#e8eaf6", fontFamily: "inherit", fontSize: 14, outline: "none"
};
 
// ─── SURVEY FORM MODAL ────────────────────────────────────────
function SurveyFormModal({ survey, onClose, onSaved }) {
  const isEdit = !!survey?.id;
  const [form, setForm] = useState({
    title:             survey?.title            || "",
    description:       survey?.description      || "",
    isPublished:       survey?.isPublished      || false,
    allowRepeatVoting: survey?.allowRepeatVoting || false,
    startAt:           survey?.startAt ? survey.startAt.slice(0, 16) : "",
    endAt:             survey?.endAt   ? survey.endAt.slice(0,   16) : "",
    questionTimeLimit: survey?.questionTimeLimit || "",
    totalTimeLimit:    survey?.totalTimeLimit    || "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState("");
 
  const f = (k) => (e) =>
    setForm(p => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
 
  const submit = async () => {
    if (!form.title.trim()) { setError("Назва обов'язкова"); return; }
    setLoading(true); setError("");
    try {
      const body = {
        ...form,
        startAt:           form.startAt           ? new Date(form.startAt).toISOString()           : null,
        endAt:             form.endAt             ? new Date(form.endAt).toISOString()             : null,
        questionTimeLimit: form.questionTimeLimit  ? parseInt(form.questionTimeLimit)               : null,
        totalTimeLimit:    form.totalTimeLimit     ? parseInt(form.totalTimeLimit)                  : null,
      };
      if (isEdit) await api.surveys.update(survey.id, body);
      else        await api.surveys.create(body);
      onSaved();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
 
  return (
    <Modal title={isEdit ? "Редагувати опитування" : "Нове опитування"} onClose={onClose}>
      <Alert msg={error} onClose={() => setError("")} />
 
      <Field label="Назва *">
        <input style={inputStyle} value={form.title} onChange={f("title")} placeholder="Назва голосування" />
      </Field>
      <Field label="Опис">
        <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
          value={form.description} onChange={f("description")} placeholder="Короткий опис..." />
      </Field>
 
      <div style={{ display: "flex", gap: 12 }}>
        <Field label="Початок">
          <input style={inputStyle} type="datetime-local" value={form.startAt} onChange={f("startAt")} />
        </Field>
        <Field label="Кінець">
          <input style={inputStyle} type="datetime-local" value={form.endAt} onChange={f("endAt")} />
        </Field>
      </div>
 
      <div style={{ display: "flex", gap: 12 }}>
        <Field label="Час на питання (сек)">
          <input style={inputStyle} type="number" value={form.questionTimeLimit} onChange={f("questionTimeLimit")} placeholder="Без ліміту" min="5" />
        </Field>
        <Field label="Час на все (сек)">
          <input style={inputStyle} type="number" value={form.totalTimeLimit} onChange={f("totalTimeLimit")} placeholder="Без ліміту" min="30" />
        </Field>
      </div>
 
      <div style={{ display: "flex", gap: 24, marginBottom: 20, flexWrap: "wrap" }}>
        {[["isPublished", "Опублікувати"], ["allowRepeatVoting", "Повторне голосування"]].map(([k, lbl]) => (
          <label key={k} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 14, color: "#e8eaf6" }}>
            <input type="checkbox" checked={form[k]} onChange={f(k)}
              style={{ width: 15, height: 15, accentColor: "#6c63ff" }} />
            {lbl}
          </label>
        ))}
      </div>
 
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onClose} className="main-btn" style={{ background: "#252b40" }}>Скасувати</button>
        <button onClick={submit} className="main-btn" disabled={loading}>
          {loading ? <Spinner /> : (isEdit ? "Зберегти" : "Створити")}
        </button>
      </div>
    </Modal>
  );
}
 
// ─── QUESTION MANAGER MODAL ───────────────────────────────────
function QuestionsModal({ survey, onClose }) {
  const [questions, setQuestions] = useState(survey.questions || []);
  const [qForm, setQForm] = useState({ text: "", questionType: "0", isRequired: true });
  const [oText, setOText] = useState({});   // questionId -> string
  const [loading, setLoading] = useState(false);
  const [error,   setError  ] = useState("");
 
  const addQuestion = async () => {
    if (!qForm.text.trim()) { setError("Введіть текст питання"); return; }
    setLoading(true); setError("");
    try {
      const q = await api.surveys.addQuestion(survey.id, {
        text:         qForm.text,
        questionType: parseInt(qForm.questionType),
        isRequired:   qForm.isRequired,
      });
      setQuestions(prev => [...prev, { ...q, options: [] }]);
      setQForm({ text: "", questionType: "0", isRequired: true });
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
 
  const addOption = async (qid) => {
    const text = (oText[qid] || "").trim();
    if (!text) { setError("Введіть текст варіанту"); return; }
    setError("");
    try {
      const o = await api.surveys.addOption(qid, { text });
      setQuestions(prev => prev.map(q =>
        q.id === qid ? { ...q, options: [...(q.options || []), o] } : q
      ));
      setOText(prev => ({ ...prev, [qid]: "" }));
    } catch (e) { setError(e.message); }
  };
 
  const typeLabel = { 0: "SingleChoice", 1: "MultipleChoice", 2: "Open" };
 
  return (
    <Modal title={`Питання: ${survey.title}`} onClose={onClose}>
      <Alert msg={error} onClose={() => setError("")} />
 
      {/* Add question form */}
      <div style={{ background: "#131726", borderRadius: 10, padding: 14, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "#7b82a8", marginBottom: 10, textTransform: "uppercase" }}>Нове питання</div>
        <Field label="Текст питання">
          <input style={inputStyle} value={qForm.text}
            onChange={e => setQForm(p => ({ ...p, text: e.target.value }))}
            placeholder="Введіть текст питання..." />
        </Field>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
          <Field label="Тип">
            <select style={inputStyle} value={qForm.questionType}
              onChange={e => setQForm(p => ({ ...p, questionType: e.target.value }))}>
              <option value="0">Single Choice</option>
              <option value="1">Multiple Choice</option>
              <option value="2">Open Text</option>
            </select>
          </Field>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#e8eaf6", cursor: "pointer", whiteSpace: "nowrap" }}>
              <input type="checkbox" checked={qForm.isRequired}
                onChange={e => setQForm(p => ({ ...p, isRequired: e.target.checked }))}
                style={{ accentColor: "#6c63ff" }} />
              Обов'язкове
            </label>
          </div>
        </div>
        <button className="main-btn" onClick={addQuestion} disabled={loading}>
          {loading ? <Spinner /> : "+ Додати питання"}
        </button>
      </div>
 
      {/* Questions list */}
      {questions.length === 0 && (
        <p style={{ color: "#7b82a8", fontSize: 14, textAlign: "center" }}>Питань ще немає</p>
      )}
      {questions.map((q, qi) => (
        <div key={q.id} style={{ background: "#131726", borderRadius: 10, padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, color: "#7b82a8" }}>Питання {qi + 1} · {typeLabel[q.questionType ?? 0]}</div>
              <div style={{ fontWeight: 600, marginTop: 2 }}>{q.text}</div>
            </div>
          </div>
 
          {/* Options */}
          {(q.options || []).length > 0 && (
            <div style={{ marginTop: 10 }}>
              {q.options.map((o, oi) => (
                <div key={o.id || oi} style={{
                  padding: "5px 10px", background: "#1a1f30", borderRadius: 6,
                  marginBottom: 5, fontSize: 13, color: "#c8cce0"
                }}>
                  {oi + 1}. {o.text}
                </div>
              ))}
            </div>
          )}
 
          {/* Add option (only for choice questions) */}
          {q.questionType !== 2 && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input style={{ ...inputStyle, flex: 1 }}
                placeholder="Новий варіант відповіді..."
                value={oText[q.id] || ""}
                onChange={e => setOText(p => ({ ...p, [q.id]: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && addOption(q.id)}
              />
              <button className="main-btn" style={{ whiteSpace: "nowrap" }} onClick={() => addOption(q.id)}>
                + Варіант
              </button>
            </div>
          )}
        </div>
      ))}
 
      <div style={{ textAlign: "right", marginTop: 10 }}>
        <button onClick={onClose} className="main-btn" style={{ background: "#252b40" }}>Закрити</button>
      </div>
    </Modal>
  );
}
 
// ─── RESULTS MODAL ────────────────────────────────────────────
function ResultsModal({ survey, onClose }) {
  const [data,    setData   ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState("");
 
  useEffect(() => {
    api.surveys.results(survey.id)
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [survey.id]);
 
  return (
    <Modal title={`Результати: ${survey.title}`} onClose={onClose}>
      {loading && <div style={{ textAlign: "center", padding: 20 }}><Spinner /></div>}
      <Alert msg={error} />
      {data && (Array.isArray(data) ? data : []).map((q, i) => {
        const total = (q.options || []).reduce((s, o) => s + (o.votes || o.votesCount || 0), 0);
        return (
          <div key={q.id} style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 10 }}>
              {i + 1}. {q.text}
            </div>
            {(q.options || []).map(o => {
              const v   = o.votes || o.votesCount || 0;
              const pct = total > 0 ? Math.round(v / total * 100) : 0;
              return (
                <div key={o.id} className="result-card" style={{ marginBottom: 8, padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 14 }}>{o.text}</span>
                    <span style={{ fontSize: 13, color: "#00e5c0", fontWeight: 700 }}>{pct}% ({v})</span>
                  </div>
                  <div className="progress">
                    <div className="progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {(!q.options || q.options.length === 0) && (
              <p style={{ fontSize: 13, color: "#7b82a8" }}>Відкрите питання, {total} відповідей</p>
            )}
          </div>
        );
      })}
      {data && data.length === 0 && (
        <p style={{ color: "#7b82a8", textAlign: "center" }}>Голосів поки немає</p>
      )}
    </Modal>
  );
}
 
// ═══════════════════════════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════════════════════════
 
// ─── DASHBOARD ────────────────────────────────────────────────
function Dashboard() {
  const [stats,   setStats  ] = useState({ surveys: 0, users: 0, votes: 0, active: 0 });
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    Promise.allSettled([api.surveys.getAll(1, 100), api.users.getAll()])
      .then(([sRes, uRes]) => {
        const surveys = sRes.status === "fulfilled"
          ? (Array.isArray(sRes.value) ? sRes.value : sRes.value?.items || []) : [];
        const users = uRes.status === "fulfilled"
          ? (Array.isArray(uRes.value) ? uRes.value : uRes.value?.items || []) : [];
        const active = surveys.filter(isSurveyActive).length;
        setStats({ surveys: surveys.length, users: users.length, votes: "—", active });
        setLoading(false);
      });
  }, []);
 
  return (
    <>
      <h1 className="page-title">📊 Dashboard</h1>
      <div className="cards">
        <div className="card"><h3>Опитування</h3><p>{loading ? "…" : stats.surveys}</p></div>
        <div className="card"><h3>Користувачі</h3><p>{loading ? "…" : stats.users}</p></div>
        <div className="card"><h3>Голоси</h3><p>{stats.votes}</p></div>
        <div className="card"><h3>Активні</h3><p>{loading ? "…" : stats.active}</p></div>
      </div>
    </>
  );
}
 
// ─── SURVEYS SECTION ─────────────────────────────────────────
function SurveysSection() {
  const [surveys,   setSurveys  ] = useState([]);
  const [loading,   setLoading  ] = useState(true);
  const [error,     setError    ] = useState("");
  const [modal,     setModal    ] = useState(null); // null | { type, survey? }
 
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.surveys.getAll(1, 100);
      setSurveys(Array.isArray(data) ? data : data?.items || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
 
  useEffect(() => { load(); }, [load]);
 
  const handleDelete = async (id) => {
    if (!window.confirm("Видалити опитування?")) return;
    try { await api.surveys.delete(id); load(); }
    catch (e) { setError(e.message); }
  };
 
  return (
    <>
      <div className="top-bar">
        <h1 className="page-title">🗳 Опитування</h1>
        <button className="main-btn" onClick={() => setModal({ type: "form" })}>+ Створити</button>
      </div>
 
      <Alert msg={error} onClose={() => setError("")} />
 
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spinner /></div>
      ) : (
        <div className="table-box">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Назва</th>
                <th>Статус</th>
                <th>Питань</th>
                <th>Дати</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {surveys.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "#7b82a8", padding: 24 }}>Опитувань немає</td></tr>
              )}
              {surveys.map(s => {
                const { label, cls } = getSurveyStatus(s);
                return (
                  <tr key={s.id}>
                    <td style={{ color: "#7b82a8", fontSize: 12 }}>#{s.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.title}</div>
                      {s.description && <div style={{ fontSize: 12, color: "#7b82a8" }}>{s.description.slice(0, 50)}{s.description.length > 50 ? "…" : ""}</div>}
                    </td>
                    <td><span className={`status ${cls}`}>{label}</span></td>
                    <td style={{ color: "#a89fff" }}>{(s.questions || []).length}</td>
                    <td style={{ fontSize: 12, color: "#7b82a8" }}>
                      {s.endAt ? `до ${new Date(s.endAt).toLocaleDateString("uk-UA")}` : "—"}
                    </td>
                    <td>
                      <button className="edit-btn" onClick={() => setModal({ type: "questions", survey: s })}>Питання</button>
                      <button className="edit-btn" onClick={() => setModal({ type: "results",   survey: s })}>Результати</button>
                      <button className="edit-btn" onClick={() => setModal({ type: "form",      survey: s })}>Edit</button>
                      <button className="delete-btn" onClick={() => handleDelete(s.id)}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
 
      {modal?.type === "form" && (
        <SurveyFormModal
          survey={modal.survey}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
      {modal?.type === "questions" && (
        <QuestionsModal survey={modal.survey} onClose={() => { setModal(null); load(); }} />
      )}
      {modal?.type === "results" && (
        <ResultsModal survey={modal.survey} onClose={() => setModal(null)} />
      )}
    </>
  );
}
 
// ─── USERS SECTION ───────────────────────────────────────────
function UsersSection() {
  const [users,   setUsers  ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState("");
  const [success, setSuccess] = useState("");
 
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.users.getAll();
      setUsers(Array.isArray(data) ? data : data?.items || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);
 
  useEffect(() => { load(); }, [load]);
 
  const action = async (fn, id, msg) => {
    try { await fn(id); setSuccess(msg); load(); }
    catch (e) { setError(e.message); }
  };
 
  const avatarLetter = (u) => (u.userName || u.email || "?")[0].toUpperCase();
  const roleLabel    = (u) => u.roles?.[0] || u.role || "User";
  const isBlocked    = (u) => u.isBlocked || u.lockoutEnabled === true;
 
  return (
    <>
      <h1 className="page-title">👤 Користувачі</h1>
      <Alert msg={error}   onClose={() => setError("")} />
      <Alert type="success" msg={success} onClose={() => setSuccess("")} />
 
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}><Spinner /></div>
      ) : (
        <div className="users-grid">
          {users.length === 0 && (
            <p style={{ color: "#7b82a8", gridColumn: "1/-1", textAlign: "center" }}>Користувачів немає</p>
          )}
          {users.map(u => (
            <div key={u.id} className="user-card">
              <div className="avatar" style={{ background: isBlocked(u) ? "#ff4d6d" : undefined }}>
                {avatarLetter(u)}
              </div>
              <h3 style={{ wordBreak: "break-all", fontSize: 13 }}>{u.email}</h3>
              <p>{roleLabel(u)}</p>
 
              {isBlocked(u) && (
                <span style={{
                  fontSize: 11, padding: "2px 8px", borderRadius: 99,
                  background: "rgba(255,77,109,.15)", color: "#ff4d6d",
                  border: "1px solid rgba(255,77,109,.3)", marginBottom: 8
                }}>Заблоковано</span>
              )}
 
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                {isBlocked(u) ? (
                  <button className="main-btn" style={{ fontSize: 12, padding: "6px 12px", background: "#f7b731", color: "#000" }}
                    onClick={() => action(api.users.unblock, u.id, "Розблоковано")}>
                    Розблокувати
                  </button>
                ) : (
                  <button className="main-btn" style={{ fontSize: 12, padding: "6px 12px", background: "#252b40" }}
                    onClick={() => action(api.users.block, u.id, "Заблоковано")}>
                    Блокувати
                  </button>
                )}
                <button className="main-btn" style={{ fontSize: 12, padding: "6px 12px", background: "rgba(255,77,109,.2)", color: "#ff4d6d" }}
                  onClick={() => { if (window.confirm("Видалити?")) action(api.users.delete, u.id, "Видалено"); }}>
                  Видалити
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
 
// ─── RESULTS SECTION ─────────────────────────────────────────
function ResultsSection() {
  const [surveys, setSurveys ] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data,    setData    ] = useState(null);
  const [loading, setLoading ] = useState(true);
  const [rLoading, setRLoading] = useState(false);
  const [error,   setError   ] = useState("");
 
  useEffect(() => {
    api.surveys.getAll(1, 100)
      .then(d => { setSurveys(Array.isArray(d) ? d : d?.items || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);
 
  const loadResults = async (survey) => {
    setSelected(survey); setData(null); setRLoading(true); setError("");
    try {
      const r = await api.surveys.results(survey.id);
      setData(Array.isArray(r) ? r : []);
    } catch (e) { setError(e.message); }
    finally { setRLoading(false); }
  };
 
  return (
    <>
      <h1 className="page-title">📈 Результати</h1>
      <Alert msg={error} onClose={() => setError("")} />
 
      {/* Survey selector */}
      <div style={{ marginBottom: 20 }}>
        <select
          style={{ ...inputStyle, maxWidth: 380 }}
          value={selected?.id || ""}
          onChange={e => {
            const s = surveys.find(x => String(x.id) === e.target.value);
            if (s) loadResults(s);
          }}
        >
          <option value="">— Оберіть опитування —</option>
          {surveys.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
      </div>
 
      {rLoading && <div style={{ textAlign: "center", padding: 30 }}><Spinner /></div>}
 
      {data && data.length === 0 && (
        <p style={{ color: "#7b82a8", textAlign: "center", padding: 20 }}>Голосів поки немає</p>
      )}
 
      {data && data.map((q, i) => {
        const total = (q.options || []).reduce((s, o) => s + (o.votes || o.votesCount || 0), 0);
        return (
          <div key={q.id} className="content-box" style={{ marginBottom: 16 }}>
            <h2 style={{ marginBottom: 14, fontSize: 15 }}>{i + 1}. {q.text}</h2>
            <div className="results-grid">
              {(q.options || []).map(o => {
                const v   = o.votes || o.votesCount || 0;
                const pct = total > 0 ? Math.round(v / total * 100) : 0;
                return (
                  <div key={o.id} className="result-card">
                    <h3>{o.text}</h3>
                    <div className="progress">
                      <div className="progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <p>{pct}% <span style={{ fontSize: 12, color: "#7b82a8" }}>({v} голосів)</span></p>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 13, color: "#7b82a8", marginTop: 10 }}>Всього голосів: {total}</p>
          </div>
        );
      })}
 
      {!selected && !loading && (
        <div style={{ textAlign: "center", padding: 40, color: "#7b82a8" }}>
          Оберіть опитування вище щоб побачити результати
        </div>
      )}
    </>
  );
}
 
// ─── SETTINGS SECTION ────────────────────────────────────────
function SettingsSection() {
  const [saved, setSaved] = useState(false);
  return (
    <>
      <h1 className="page-title">⚙ Налаштування</h1>
      {saved && <Alert type="success" msg="Збережено!" onClose={() => setSaved(false)} />}
      <div className="settings-box">
        <div className="setting-item">
          <label>Тема</label>
          <select><option>темна</option><option>світла</option></select>
        </div>
        <div className="setting-item">
          <label>Мова</label>
          <select><option>Українська</option><option>English</option></select>
        </div>
        <button className="save-btn" onClick={() => setSaved(true)}>Зберегти</button>
      </div>
    </>
  );
}
 
// ─── ADMIN PANEL SHELL ────────────────────────────────────────
function AdminPanel() {
  const [activePage, setActivePage] = useState("dashboard");
 
  const logout = () => {
    localStorage.removeItem("voting_token");
    localStorage.removeItem("voting_user");
    window.location.href = "/";
  };
 
  const renderContent = () => {
    switch (activePage) {
      case "dashboard": return <Dashboard />;
      case "surveys":   return <SurveysSection />;
      case "users":     return <UsersSection />;
      case "results":   return <ResultsSection />;
      case "settings":  return <SettingsSection />;
      default:          return <Dashboard />;
    }
  };
 
  const menuItems = [
    { key: "dashboard", icon: "📊", label: "Dashboard" },
    { key: "surveys",   icon: "🗳",  label: "Опитування" },
    { key: "users",     icon: "👤", label: "Користувачі" },
    { key: "results",   icon: "📈", label: "Результати" },
    { key: "settings",  icon: "⚙",  label: "Налаштування" },
  ];
 
  return (
    <div className="admin-panel">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
 
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <h2 className="logo">Admin Panel</h2>
          <ul className="menu">
            {menuItems.map(({ key, icon, label }) => (
              <li
                key={key}
                onClick={() => setActivePage(key)}
                style={{
                  background: activePage === key ? "rgba(108,99,255,.15)" : undefined,
                  color:      activePage === key ? "#a89fff"               : undefined,
                  borderRadius: 8,
                }}
              >
                {icon} {label}
              </li>
            ))}
          </ul>
        </div>
        <button className="logout-btn" onClick={logout}>Вийти</button>
      </aside>
 
      {/* Main */}
      <main className="content">
        {renderContent()}
      </main>
    </div>
  );
}
 
export default AdminPanel;