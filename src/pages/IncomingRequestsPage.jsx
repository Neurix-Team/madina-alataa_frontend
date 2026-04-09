// src/pages/IncomingRequestsPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaUser,
  FaChild,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import RocketBackground from '../components/common/RocketBackground';
import CanvasBackground from '../components/common/CanvasBackground';

const REQUESTS_STORAGE_KEY = 'parent_requests_v1';

const CSS = `
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .incoming-requests-container {
    direction: rtl;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
    font-family: 'Cairo', sans-serif;
  }

  .incoming-requests-header {
    text-align: center;
    margin-bottom: 30px;
    color: white;
  }

  .incoming-requests-title {
    font-size: 2.5rem;
    font-weight: 900;
    margin-bottom: 10px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  }

  .incoming-requests-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .requests-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .request-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    border: 1px solid rgba(255,255,255,0.2);
    animation: slideInUp 0.6s ease both;
    backdrop-filter: blur(10px);
  }

  .request-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .request-id {
    font-weight: 900;
    color: #1e293b;
    font-size: 1.1rem;
  }

  .request-status {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  .request-status--pending {
    background: #fef3c7;
    color: #d97706;
  }

  .request-status--approved {
    background: #d1fae5;
    color: #059669;
  }

  .request-status--rejected {
    background: #fee2e2;
    color: #dc2626;
  }

  .request-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 15px;
  }

  .request-details {
    margin-bottom: 20px;
  }

  .request-detail {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    color: #64748b;
  }

  .request-detail-icon {
    margin-left: 10px;
    width: 16px;
    opacity: 0.7;
  }

  .request-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .btn {
    padding: 10px 20px;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
  }

  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
  }

  .btn--approve {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
  }

  .btn--reject {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
  }

  .btn--view {
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
  }

  .empty-state {
    text-align: center;
    color: white;
    padding: 50px 20px;
  }

  .empty-state-icon {
    font-size: 4rem;
    margin-bottom: 20px;
    opacity: 0.7;
  }

  .empty-state-title {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 10px;
  }

  .empty-state-text {
    font-size: 1.1rem;
    opacity: 0.8;
  }

  @media (max-width: 768px) {
    .incoming-requests-container {
      padding: 15px;
    }

    .incoming-requests-title {
      font-size: 2rem;
    }

    .requests-grid {
      grid-template-columns: 1fr;
    }

    .request-card {
      padding: 20px;
    }

    .request-actions {
      flex-direction: column;
    }

    .btn {
      justify-content: center;
    }
  }
`;

const IncomingRequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const saved = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (saved) {
      setRequests(JSON.parse(saved));
    }
  };

  const updateRequestStatus = (requestId, newStatus) => {
    const updatedRequests = requests.map(req =>
      req.id === requestId ? { ...req, status: newStatus } : req
    );
    setRequests(updatedRequests);
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(updatedRequests));
  };

  const handleApprove = (requestId) => {
    updateRequestStatus(requestId, 'مقبول');
  };

  const handleReject = (requestId) => {
    updateRequestStatus(requestId, 'مرفوض');
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
  };

  const closeDetails = () => {
    setSelectedRequest(null);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'قيد المراجعة':
        return 'request-status--pending';
      case 'مقبول':
        return 'request-status--approved';
      case 'مرفوض':
        return 'request-status--rejected';
      default:
        return 'request-status--pending';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'قيد المراجعة':
        return <FaClock />;
      case 'مقبول':
        return <FaCheckCircle />;
      case 'مرفوض':
        return <FaTimesCircle />;
      default:
        return <FaClock />;
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <CanvasBackground />
      <RocketBackground />

      <div className="incoming-requests-container">
        <div className="incoming-requests-header">
          <h1 className="incoming-requests-title">
            <FaFileAlt style={{ marginLeft: 15 }} />
            الطلبات الواردة
          </h1>
          <p className="incoming-requests-subtitle">
            إدارة طلبات الآباء والأمهات
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <FaFileAlt />
            </div>
            <h2 className="empty-state-title">لا توجد طلبات واردة</h2>
            <p className="empty-state-text">
              جميع الطلبات تمت مراجعتها أو لم يتم إرسال أي طلبات جديدة بعد
            </p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((request, index) => (
              <div
                key={request.id}
                className="request-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="request-header">
                  <span className="request-id">{request.id}</span>
                  <span className={`request-status ${getStatusClass(request.status)}`}>
                    {getStatusIcon(request.status)}
                    {request.status}
                  </span>
                </div>

                <h3 className="request-title">{request.title}</h3>

                <div className="request-details">
                  <div className="request-detail">
                    <FaUser className="request-detail-icon" />
                    <span>ولي الأمر: أحمد السيد</span>
                  </div>
                  <div className="request-detail">
                    <FaChild className="request-detail-icon" />
                    <span>الطفل: {request.childName || 'غير محدد'} ({request.childAge || 0} سنوات)</span>
                  </div>
                  <div className="request-detail">
                    <FaClock className="request-detail-icon" />
                    <span>تاريخ الطلب: {new Date(request.createdAt || parseInt(request.id.split('-')[1])).toLocaleDateString('ar-EG')}</span>
                  </div>
                  {request.amount > 0 && (
                    <div className="request-detail">
                      <span style={{ fontWeight: 'bold', color: '#059669' }}>المبلغ المطلوب: {request.amount} جنيه</span>
                    </div>
                  )}
                </div>

                <div className="request-actions">
                  <button
                    className="btn btn--view"
                    onClick={() => handleViewDetails(request)}
                  >
                    <FaEye />
                    عرض التفاصيل
                  </button>

                  {request.status === 'قيد المراجعة' && (
                    <>
                      <button
                        className="btn btn--approve"
                        onClick={() => handleApprove(request.id)}
                      >
                        <FaCheck />
                        قبول
                      </button>
                      <button
                        className="btn btn--reject"
                        onClick={() => handleReject(request.id)}
                      >
                        <FaTimes />
                        رفض
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20,
            }}
            onClick={closeDetails}
          >
            <div
              style={{
                background: 'white',
                borderRadius: 20,
                padding: 30,
                maxWidth: 600,
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ marginBottom: 20, color: '#1e293b' }}>
                تفاصيل الطلب: {selectedRequest.id}
              </h2>

              <div style={{ marginBottom: 20 }}>
                <h3 style={{ color: '#374151', marginBottom: 10 }}>{selectedRequest.title}</h3>
                <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
                  هذا الطلب يحتاج إلى مراجعة من قبل الإدارة. يرجى التأكد من صحة البيانات والمستندات المرفقة قبل اتخاذ القرار.
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <h4 style={{ color: '#374151', marginBottom: 10 }}>معلومات إضافية:</h4>
                <ul style={{ color: '#6b7280', paddingRight: 20 }}>
                  <li>نوع الطلب: {selectedRequest.type || 'طبي'}</li>
                  <li>الطفل: {selectedRequest.childName} ({selectedRequest.childAge} سنوات)</li>
                  <li>المدينة: {selectedRequest.childCity}</li>
                  {selectedRequest.amount > 0 && <li>المبلغ المطلوب: {selectedRequest.amount} جنيه</li>}
                  <li>درجة الاستعجال: {selectedRequest.urgency || 'عادي'}</li>
                  <li>تاريخ الإنشاء: {new Date(selectedRequest.createdAt).toLocaleString('ar-EG')}</li>
                </ul>
              </div>

              {selectedRequest.description && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ color: '#374151', marginBottom: 10 }}>وصف الطلب:</h4>
                  <p style={{ color: '#6b7280', lineHeight: 1.6, background: '#f9fafb', padding: 15, borderRadius: 8 }}>
                    {selectedRequest.description}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  className="btn btn--view"
                  onClick={closeDetails}
                  style={{ background: '#6b7280' }}
                >
                  إغلاق
                </button>

                {selectedRequest.status === 'قيد المراجعة' && (
                  <>
                    <button
                      className="btn btn--approve"
                      onClick={() => {
                        handleApprove(selectedRequest.id);
                        closeDetails();
                      }}
                    >
                      <FaCheck />
                      قبول الطلب
                    </button>
                    <button
                      className="btn btn--reject"
                      onClick={() => {
                        handleReject(selectedRequest.id);
                        closeDetails();
                      }}
                    >
                      <FaTimes />
                      رفض الطلب
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default IncomingRequestsPage;