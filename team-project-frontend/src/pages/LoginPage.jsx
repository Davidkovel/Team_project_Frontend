import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert, Spinner } from "../components/Helpers";
import api from "../api/api";

function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
 
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const data = await api.auth.login(form);
      // backend returns { token } or { accessToken } or token directly
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
        <div className="auth-title">Вхід до системи</div>
        <div className="auth-sub">Введіть облікові дані для продовження</div>
        <Alert msg={error} />
        <form onSubmit={submit}>
          <div className="field"><label>Email</label>
            <input type="email" placeholder="admin@example.com" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="field"><label>Пароль</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? <Spinner /> : "Увійти"}
          </button>
        </form>
        <div className="auth-switch">Немає акаунту? <a onClick={() => navigate("/register")}>Зареєструватись</a></div>
        <div className="alert alert-info mt-16" style={{ fontSize: 13 }}>
          🔑 Demo: admin@example.com / Admin123!
        </div>
      </div>
    </div>
  );
}

export default LoginPage;