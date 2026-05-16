import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Alert, Spinner } from "../components/Helpers";
import "../styles/AuthPages.css";

function RegisterPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError("Паролі не збігаються"); return; }
    setLoading(true); setError("");
    try {
      await api.auth.register({ email: form.email, password: form.password });
      const data = await api.auth.login({ email: form.email, password: form.password });
      const token = data.token || data.accessToken || data;
      const payload = token.split(".")[1];
      let parsed = {};
      try { parsed = JSON.parse(atob(payload)); } catch {}
      const roles = parsed["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
        || parsed.role || parsed.roles || [];
      login({ token, email: form.email, roles: Array.isArray(roles) ? roles : [roles] });
      navigate("/");
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
 
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-title">Реєстрація</div>
        <div className="auth-sub">Створіть обліковий запис для участі</div>
        <Alert msg={error} />
        <form onSubmit={submit}>
          <div className="field"><label>Email</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="field"><label>Пароль</label>
            <input type="password" placeholder="Мін. 8 символів" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <div className="field"><label>Підтвердіть пароль</label>
            <input type="password" value={form.confirmPassword}
              onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? <Spinner /> : "Зареєструватись"}
          </button>
        </form>
        <div className="auth-switch">Вже є акаунт? <a onClick={() => navigate("/login")}>Увійти</a></div>
      </div>
    </div>
  );
}

export default RegisterPage;