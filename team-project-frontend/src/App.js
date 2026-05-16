import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import "./App.css";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import {SurveysPage, SurveyFormPage, VotePage } from "./pages/SurveysPage";
import ResultsPage from "./pages/ResultsPage";
import AdminPanel from "./pages/AdminPanel";
import UsersPage from "./pages/UsersPage";
import { AuthProvider } from "./context/AuthContext";


import Nav from "./components/Nav";


function useRoute() {
  const [path, setPath] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const handler = () => setPath(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = useCallback((to) => { window.location.hash = to; }, []);
  return { path, navigate };
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Nav />

        <Routes>
          <Route path="/" element={<SurveysPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/surveys/create"
            element={<SurveyFormPage />}
          />

          <Route
            path="/surveys/:id/edit"
            element={<SurveyFormPage />}
          />

          <Route
            path="/surveys/:id/vote"
            element={<VotePage />}
          />

          <Route
            path="/surveys/:id/results"
            element={<ResultsPage />}
          />

          <Route
            path="/users"
            element={<UsersPage />}
          /> 

          <Route
            path="/admin"
            element={<AdminPanel />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}