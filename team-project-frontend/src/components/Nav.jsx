import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Nav() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;

  const { user, logout, isAdmin, isLoggedIn } = useAuth();

  return (
    <nav className="nav">
      <span
        className="nav-logo"
        onClick={() => navigate("/")}
      >
        🗳 VoteSystem
      </span>

      <button
        className={`nav-btn ${path === "/" ? "active" : ""}`}
        onClick={() => navigate("/")}
      >
        Опитування
      </button>

      {isAdmin && (
        <button
          className={`nav-btn ${
            path === "/users" ? "active" : ""
          }`}
          onClick={() => navigate("/users")}
        >
          Користувачі
        </button>
      )}

      {isLoggedIn ? (
        <>
          <span>{user?.email}</span>

          <button onClick={logout}>
            Вийти
          </button>
        </>
      ) : (
        <>
          <button onClick={() => navigate("/login")}>
            Увійти
          </button>

          <button onClick={() => navigate("/register")}>
            Реєстрація
          </button>
        </>
      )}
    </nav>
  );
}