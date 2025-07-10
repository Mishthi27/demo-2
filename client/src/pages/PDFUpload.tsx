import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './PDFUpload.css';

const PDFUpload: React.FC = () => {
  const { token } = useUser();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setMessage('');
    } else {
      setMessage('Please select a valid PDF file.');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/api/upload-pdf/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage(`PDF uploaded successfully! Filename: ${data.filename}`);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('pdfFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('Error uploading PDF. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>PDF Upload</h1>
        <p>Upload scanned documents for data extraction</p>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleUpload} className="upload-form">
        <div className="file-input-container">
          <input
            type="file"
            id="pdfFile"
            accept=".pdf"
            onChange={handleFileSelect}
            className="file-input"
          />
          <label htmlFor="pdfFile" className="file-label">
            {selectedFile ? selectedFile.name : 'Choose PDF file'}
          </label>
        </div>

        <div className="upload-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="upload-button"
          >
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PDFUpload; 