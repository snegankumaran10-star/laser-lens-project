import { useMemo, useState } from 'react';
import './App.css';

const emptyTerms = {
  monthlyRent: null,
  securityDeposit: null,
  lockInPeriod: null,
  noticePeriod: null,
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const fileLabel = useMemo(() => {
    if (!selectedFile) return 'No file selected';
    return selectedFile.name;
  }, [selectedFile]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError('Please choose a PDF file before analysing.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to extract the file.');
      }

      setResult(data);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">Development preview</p>
        <h1>Lease Lens</h1>
        <p className="subtitle">
          Upload a text-based rental agreement PDF to preview key commercial terms
          and the raw extracted text during local development.
        </p>

        <form className="upload-panel" onSubmit={handleSubmit}>
          <label className="file-picker">
            <input
              type="file"
              accept="application/pdf"
              onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            />
            <span className="file-picker-label">Choose PDF</span>
          </label>

          <div className="file-summary">{fileLabel}</div>

          <button type="submit" className="primary-button" disabled={!selectedFile || loading}>
            {loading ? 'Analyzing…' : 'Analyse Document'}
          </button>
        </form>

        {error ? (
          <div className="status-box status-error" role="alert">
            {error}
          </div>
        ) : null}

        <div className="meta-grid">
          {Object.entries(result?.candidateTerms || emptyTerms).map(([key, value]) => (
            <div className="meta-item" key={key}>
              <span className="meta-label">
                {key === 'monthlyRent' && 'Monthly rent'}
                {key === 'securityDeposit' && 'Security deposit'}
                {key === 'lockInPeriod' && 'Lock-in period'}
                {key === 'noticePeriod' && 'Notice period'}
              </span>
              <strong>{value || 'Not found'}</strong>
            </div>
          ))}
        </div>

        {result ? (
          <div className="results-box">
            <h2>Extracted text</h2>
            <textarea readOnly value={result.extractedText} />
          </div>
        ) : null}

        <div className="disclaimer-box">
          For informational purposes only. This tool does not provide legal advice.
        </div>
      </section>
    </main>
  );
}

export default App;
