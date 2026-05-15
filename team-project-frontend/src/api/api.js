const BASE_URL = "https://votingapp.bluegrass-91a5f309.polandcentral.azurecontainerapps.io";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const authAPI = {
  register: (data) =>
    fetch(`${BASE_URL}/api/Auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  login: (data) =>
    fetch(`${BASE_URL}/api/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
};

export const surveysAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/api/Surveys?page=1&pageSize=20`, { headers: getHeaders() }),

  getById: (id) =>
    fetch(`${BASE_URL}/api/Surveys/${id}`, { headers: getHeaders() }),

  create: (data) =>
    fetch(`${BASE_URL}/api/Surveys`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    fetch(`${BASE_URL}/api/Surveys/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    fetch(`${BASE_URL}/api/Surveys/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }),

  addQuestion: (surveyId, data) =>
    fetch(`${BASE_URL}/api/Surveys/${surveyId}/questions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),

  addOption: (questionId, data) =>
    fetch(`${BASE_URL}/api/Surveys/questions/${questionId}/options`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),

  vote: (questionId, data) =>
    fetch(`${BASE_URL}/api/Surveys/questions/${questionId}/vote`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }),

  getResults: (id) =>
    fetch(`${BASE_URL}/api/Surveys/${id}/results`, { headers: getHeaders() }),

  getStatistics: (id) =>
    fetch(`${BASE_URL}/api/Surveys/${id}/statistics`, { headers: getHeaders() }),
};

export const usersAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/api/Users`, { headers: getHeaders() }),

  block: (id) =>
    fetch(`${BASE_URL}/api/Users/block/${id}`, {
      method: "POST",
      headers: getHeaders(),
    }),

  unblock: (id) =>
    fetch(`${BASE_URL}/api/Users/unblock/${id}`, {
      method: "POST",
      headers: getHeaders(),
    }),

  delete: (id) =>
    fetch(`${BASE_URL}/api/Users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    }),
};