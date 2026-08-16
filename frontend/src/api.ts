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

export async function askRAG(
  question: string,
  company?: string,
  role?: string,
  source_type?: string,
  top_k: number = 3
) {
  const response = await fetch(`${API_URL}/api/rag/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      company,
      role,
      source_type,
      top_k,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get AI interview answer");
  }

  return response.json();
}

export async function getInterviewIntelligence(
  company: string,
  role?: string,
  top_k: number = 10
) {
  const response = await fetch(`${API_URL}/api/interview-intelligence`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      company,
      role,
      top_k,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to get interview intelligence");
  }

  return response.json();
}