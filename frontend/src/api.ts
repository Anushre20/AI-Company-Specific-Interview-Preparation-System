const API_URL = "http://localhost:8000";

export async function checkBackend() {
  const response = await fetch(`${API_URL}/api/health`);

  if (!response.ok) {
    throw new Error("Backend request failed");
  }

  return response.json();
}

export async function getCompanies() {
  const response = await fetch(`${API_URL}/api/companies`);

  if (!response.ok) {
    throw new Error("Failed to fetch companies");
  }

  return response.json();
}

export async function getQuestions() {
  const response = await fetch(`${API_URL}/api/questions`);

  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }

  return response.json();
}