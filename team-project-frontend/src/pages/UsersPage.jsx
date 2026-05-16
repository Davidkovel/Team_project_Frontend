import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";
import { Alert, Spinner } from "../components/Helpers";


function UsersPage({ navigate }) {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
 
  const load = async () => {
    try {
      const data = await api.users.getAll();
      setUsers(Array.isArray(data) ? data : data.items || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
 
  useEffect(() => { if (isAdmin) load(); }, []);
 
  if (!isAdmin) return <div className="centered"><p className="meta">Доступ заборонено</p></div>;
  if (loading)  return <div className="centered"><Spinner /></div>;
 
  const action = async (fn, id) => {
    try { await fn(id); load(); } catch (e) { alert(e.message); }
  };
 
  return (
    <div className="page-wide">
      <h1>Управління користувачами</h1>
      <Alert msg={error} />
      <div className="table-wrap" style={{ marginTop: 24 }}>
        <table>
          <thead>
            <tr>
              <th>Email / Username</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Зареєстровано</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{u.email}</div>
                  {u.userName && <div className="meta">{u.userName}</div>}
                </td>
                <td><span className="tag">{u.role || "User"}</span></td>
                <td>
                  {u.isBlocked
                    ? <span className="badge badge-closed">Заблоковано</span>
                    : <span className="badge badge-active">Активний</span>}
                </td>
                <td className="meta">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("uk-UA") : "—"}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    {u.isBlocked
                      ? <button className="btn btn-warn btn-sm" onClick={() => action(api.users.unblock, u.id)}>Розблокувати</button>
                      : <button className="btn btn-warn btn-sm" onClick={() => action(api.users.block, u.id)}>Блокувати</button>}
                    <button className="btn btn-danger btn-sm" onClick={() => { if (window.confirm("Видалити?")) action(api.users.delete, u.id); }}>
                      Видалити
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && <div className="centered"><p className="meta">Користувачів немає</p></div>}
    </div>
  );
}

export default UsersPage;