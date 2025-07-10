import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './FormSubmission.css';

interface FormData {
  studentName: string;
  age: string;
  grade: string;
  attendance: string;
  healthStatus: string;
  notes: string;
  timestamp: string;
}

const FormSubmission: React.FC = () => {
  const { user, token } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    studentName: '',
    age: '',
    grade: '',
    attendance: 'present',
    healthStatus: 'good',
    notes: '',
    timestamp: new Date().toISOString(),
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSubmissions, setPendingSubmissions] = useState<FormData[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending submissions from IndexedDB
    loadPendingSubmissions();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline && pendingSubmissions.length > 0) {
      syncPendingSubmissions();
    }
  }, [isOnline, pendingSubmissions.length]);

  const loadPendingSubmissions = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['pendingSubmissions'], 'readonly');
      const store = transaction.objectStore('pendingSubmissions');
      const request = store.getAll();
      
      request.onsuccess = () => {
        setPendingSubmissions(request.result || []);
      };
      
      request.onerror = () => {
        console.error('Error loading pending submissions:', request.error);
      };
    } catch (error) {
      console.error('Error loading pending submissions:', error);
    }
  };

  const openDB = async () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('RRFDatabase', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('pendingSubmissions')) {
          db.createObjectStore('pendingSubmissions', { keyPath: 'timestamp' });
        }
      };
    });
  };

  const saveToIndexedDB = async (data: FormData) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(['pendingSubmissions'], 'readwrite');
      const store = transaction.objectStore('pendingSubmissions');
      const request = store.add(data);
      
      request.onsuccess = () => {
        setPendingSubmissions(prev => [...prev, data]);
        setMessage('Form saved offline. Will sync when online.');
      };
      
      request.onerror = () => {
        console.error('Error saving to IndexedDB:', request.error);
        setMessage('Error saving form data.');
      };
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
      setMessage('Error saving form data.');
    }
  };

  const syncPendingSubmissions = async () => {
    if (pendingSubmissions.length === 0) return;

    try {
      const response = await fetch('http://localhost:8000/api/forms/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(pendingSubmissions),
      });

      if (response.ok) {
        // Clear IndexedDB
        const db = await openDB();
        const transaction = db.transaction(['pendingSubmissions'], 'readwrite');
        const store = transaction.objectStore('pendingSubmissions');
        const clearRequest = store.clear();
        
        clearRequest.onsuccess = () => {
          setPendingSubmissions([]);
          setMessage('All pending submissions synced successfully!');
        };
      }
    } catch (error) {
      console.error('Error syncing submissions:', error);
      setMessage('Error syncing submissions. Will retry when online.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    const submissionData = {
      ...formData,
      timestamp: new Date().toISOString(),
    };

    if (isOnline) {
      try {
        const response = await fetch('http://localhost:8000/api/forms/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify([submissionData]),
        });

        if (response.ok) {
          setMessage('Form submitted successfully!');
          setFormData({
            studentName: '',
            age: '',
            grade: '',
            attendance: 'present',
            healthStatus: 'good',
            notes: '',
            timestamp: new Date().toISOString(),
          });
        } else {
          throw new Error('Submission failed');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        await saveToIndexedDB(submissionData);
      }
    } else {
      await saveToIndexedDB(submissionData);
    }

    setSubmitting(false);
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Field Data Submission</h1>
        <div className="status-indicator">
          <span className={`status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </span>
          {pendingSubmissions.length > 0 && (
            <span className="pending-count">
              {pendingSubmissions.length} pending
            </span>
          )}
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="submission-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="studentName">Student Name *</label>
            <input
              type="text"
              id="studentName"
              value={formData.studentName}
              onChange={(e) => handleInputChange('studentName', e.target.value)}
              required
              placeholder="Enter student name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="Enter age"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="grade">Grade</label>
            <select
              id="grade"
              value={formData.grade}
              onChange={(e) => handleInputChange('grade', e.target.value)}
            >
              <option value="">Select Grade</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="attendance">Attendance</label>
            <select
              id="attendance"
              value={formData.attendance}
              onChange={(e) => handleInputChange('attendance', e.target.value)}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="healthStatus">Health Status</label>
          <select
            id="healthStatus"
            value={formData.healthStatus}
            onChange={(e) => handleInputChange('healthStatus', e.target.value)}
          >
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
            <option value="needs_attention">Needs Attention</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes or observations..."
            rows={4}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="submit-button"
          >
            {submitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormSubmission; 