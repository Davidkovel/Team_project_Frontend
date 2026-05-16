const BASE_URL = "http://localhost:8080";

function getHeaders() {
  const token = localStorage.getItem("voting_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
 
async function apiFetch(url, options = {}) {
  const res = await fetch(`${BASE_URL}${url}`, { headers: getHeaders(), ...options });
  if (res.status === 204) return null;
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(json?.message || json?.title || json || `HTTP ${res.status}`);
  return json;
}
 
const api = {
  auth: {
    register: (d) => apiFetch("/api/Auth/register", { method: "POST", body: JSON.stringify(d) }),
    login:    (d) => apiFetch("/api/Auth/login",    { method: "POST", body: JSON.stringify(d) }),
  },
  surveys: {
    getAll:     (p=1,ps=20) => apiFetch(`/api/Surveys?page=${p}&pageSize=${ps}`),
    getById:    (id)        => apiFetch(`/api/Surveys/${id}`),
    create:     (d)         => apiFetch("/api/Surveys",        { method: "POST",   body: JSON.stringify(d) }),
    update:     (id, d)     => apiFetch(`/api/Surveys/${id}`,  { method: "PUT",    body: JSON.stringify(d) }),
    delete:     (id)        => apiFetch(`/api/Surveys/${id}`,  { method: "DELETE" }),
    addQuestion:(sid, d)    => apiFetch(`/api/Surveys/${sid}/questions`, { method: "POST", body: JSON.stringify(d) }),
    addOption:  (qid, d)    => apiFetch(`/api/Surveys/questions/${qid}/options`, { method: "POST", body: JSON.stringify(d) }),
    vote:       (qid, d)    => apiFetch(`/api/Surveys/questions/${qid}/vote`,    { method: "POST", body: JSON.stringify(d) }),
    results:    (id)        => apiFetch(`/api/Surveys/${id}/results`),
  },
  users: {
    getAll:  ()   => apiFetch("/api/Users"),
    block:   (id) => apiFetch(`/api/Users/block/${id}`,   { method: "POST" }),
    unblock: (id) => apiFetch(`/api/Users/unblock/${id}`, { method: "POST" }),
    delete:  (id) => apiFetch(`/api/Users/${id}`,         { method: "DELETE" }),
  },
};
 
export default api;