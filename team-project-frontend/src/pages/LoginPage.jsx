import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/api";
import "../styles/AuthPages.css";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = "Введіть email";
    if (!form.password) newErrors.password = "Введіть пароль";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await authAPI.login({
        email: form.email,
        password: form.password,
      });

      if (!response.ok) throw new Error("Невірний email або пароль");

      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/surveys");
    } catch (err) {
      setErrors({ general: err.message });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Вхід</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="user@example.com"
              value={form.email}
              onChange={handleChange}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Ваш пароль"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {errors.general && <span className="error">{errors.general}</span>}

          <button type="submit" className="auth-btn">
            Увійти
          </button>
        </form>

        <p className="auth-footer">
          Немає акаунту? <a href="/register">Зареєструватись</a>
        </p>
      </div>
    </div>
  );
}