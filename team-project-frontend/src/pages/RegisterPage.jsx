import { useState } from "react";
import "../styles/AuthPages.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Введіть ваше ім'я";
    if (!form.email.trim()) {
      newErrors.email = "Введіть email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Невірний формат email";
    }
    if (!form.password) {
      newErrors.password = "Введіть пароль";
    } else if (form.password.length < 6) {
      newErrors.password = "Мінімум 6 символів";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Паролі не співпадають";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    console.log("Реєстрація:", form);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <p>Реєстрацію завершено!</p>
          <a href="/login">Увійти</a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1 className="auth-title">Реєстрація</h1>

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="name">Ім'я</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Іван Мельник"
              value={form.name}
              onChange={handleChange}
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

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
              placeholder="Мінімум 6 символів"
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          <div className="field">
            <label htmlFor="confirmPassword">Повторіть пароль</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Повторіть пароль"
              value={form.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
            />
            {errors.confirmPassword && (
              <span className="error">{errors.confirmPassword}</span>
            )}
          </div>

          <button type="submit" className="auth-btn">
            Зареєструватись
          </button>
        </form>

        <p className="auth-footer">
          Вже є акаунт? <a href="/login">Увійти</a>
        </p>
      </div>
    </div>
  );
}