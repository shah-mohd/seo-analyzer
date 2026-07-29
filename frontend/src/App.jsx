import { useState, useEffect, useRef } from "react";
import UrlForm from "./components/UrlForm";
import ReportView from "./components/ReportView";
import { startAnalysis, getResults } from "./api";

export default function App() {
  const [jobId, setJobId] = useState(null);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // keep a reference to the polling interval, can clear it later
  const pollingRef = useRef(null);

  async function handleAnalyze(url) {
    setErrorMessage("");
    setResult(null);
    setIsLoading(true);

    try {
      const { jobId } = await startAnalysis(url);
      setJobId(jobId);
    } catch (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  }

  // whenever get a new jobId, start checking on it every 3 seconds
  useEffect(() => {
    if (!jobId) return;

    async function poll() {
      try {
        const data = await getResults(jobId);

        if (data.status === "complete") {
          setResult(data);
          setIsLoading(false);
          clearInterval(pollingRef.current);
        } else if (data.status === "failed") {
          setErrorMessage(data.error || "Analysis failed");
          setIsLoading(false);
          clearInterval(pollingRef.current);
        }
        // if it's "pending" or "processing", just keep polling
      } catch (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        clearInterval(pollingRef.current);
      }
    }

    poll();
    pollingRef.current = setInterval(poll, 3000); // then every 3 seconds

    return () => clearInterval(pollingRef.current); // cleanup
  }, [jobId]);

  return (
    <div className="app">
      <header>
        <h1>SEO Analyzer</h1>
        <p>Enter a website URL to get a SEO report.</p>
      </header>

      <UrlForm onSubmit={handleAnalyze} isLoading={isLoading} />

      {isLoading && (
        <p className="status-message">
          Analyzing the site... this can take up to a minute.
        </p>
      )}
      {errorMessage && <p className="status-message error">{errorMessage}</p>}

      {result && result.status === "complete" && <ReportView result={result} />}
    </div>
  );
}
