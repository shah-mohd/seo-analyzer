const API_URL = import.meta.env.VITE_API_URL;

export async function startAnalysis(url) {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to start analysis");
  }

  return data; // { jobId, status }
}

export async function getResults(jobId) {
  const response = await fetch(`${API_URL}/api/results/${jobId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch results");
  }

  console.log(data);
  return data; // { status, report, error, ... }
}
