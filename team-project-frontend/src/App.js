import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import "./App.css";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import SurveysPage from "./pages/SurveysPage";
import ResultsPage from "./pages/ResultsPage";
import AdminPanel from "./pages/AdminPanel";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/surveys" element={<SurveysPage />} />
                <Route
                    path="/surveys/:id/results"
                    element={<ResultsPage />}
                />
                
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </Router>
    );
}

export default App;