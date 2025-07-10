import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Reports.css';

const Reports: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerateReport = async () => {
    setGenerating(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/report/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'field-report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setMessage('Report generated and downloaded successfully!');
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {
      console.error('Report generation error:', error);
      setMessage('Error generating report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Generate Reports</h1>
        <p>Create and download PDF reports of field data</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="reports-content">
        <div className="report-card">
          <h3>Field Data Summary Report</h3>
          <p>Generate a comprehensive PDF report containing all field data, statistics, and insights.</p>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="generate-button"
          >
            {generating ? 'Generating...' : 'Generate Report'}
          </button>
        </div>

        <div className="report-info">
          <h4>Report Includes:</h4>
          <ul>
            <li>Student attendance statistics</li>
            <li>Health status summaries</li>
            <li>Grade-wise performance data</li>
            <li>Field worker activity logs</li>
            <li>Growth and trend analysis</li>
          </ul>
        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard')}
        className="back-button"
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export default Reports; 