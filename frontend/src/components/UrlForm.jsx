import { useState } from "react";

// take a URL and calls onSubmit when the user hit the button
export default function UrlForm({ onSubmit, isLoading }) {
  const [url, setUrl] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim()) return;

    // add https:// automatically if the user forgot
    const finalUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `https://${url}`;

    onSubmit(finalUrl);
  }

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter website URL, e.g. example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Analyzing..." : "Analyze"}
      </button>
    </form>
  );
}
