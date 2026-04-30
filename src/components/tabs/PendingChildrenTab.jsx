// src/components/tabs/PendingChildrenTab.jsx
/**
 * PendingChildrenTab — Admin-only management of pending child requests.
 * Approve or reject child registration requests.
 */
import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { childrenService } from '../../services/childrenService';

import {
  FaChild,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaUserShield,
  FaCoins,
  FaHeart,
  FaExclamationTriangle,
  FaBaby,
  FaUser,
  FaCalendar
} from 'react-icons/fa';

const PENDING_CSS = `
  .pending-children-tab {
    direction: rtl;
    display: grid;
    gap: 24px;
    font-family: 'Cairo', sans-serif;
    color: #0f172a;
    padding: 24px;
  }

  .pending-header {
    background:
      radial-gradient(circle at top right, rgba(245,158,11,0.12), transparent 28%),
      radial-gradient(circle at bottom left, rgba(251,191,36,0.08), transparent 24%),
      linear-gradient(135deg, #ffffff 0%, #fffbeb 55%, #fef3c7 100%);
    border-radius: 28px;
    padding: 32px;
    box-shadow: 0 18px 40px rgba(15,23,42,0.06);
    border: 1.5px solid rgba(226,232,240,0.9);
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .pending-header__icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #d97706;
    font-size: 28px;
    box-shadow: 0 12px 24px rgba(245,158,11,0.12);
  }

  .pending-header__title {
    font-size: 28px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .pending-header__subtitle {
    color: #64748b;
    font-size: 14px;
    font-weight: 600;
  }

  .pending-header__count {
    margin-right: auto;
    padding: 12px 24px;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    border-radius: 16px;
    font-size: 14px;
    font-weight: 800;
    color: #92400e;
  }

  .pending-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 20px;
  }

  .pending-card {
    background: linear-gradient(180deg, #ffffff 0%, #fffbeb 100%);
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 14px 30px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(226,232,240,0.9);
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;
  }

  .pending-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 34px rgba(15,23,42,0.08);
  }

  .pending-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #f59e0b, #fbbf24);
  }

  .pending-card__header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .pending-card__icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(253,230,138,0.9);
    box-shadow: 0 8px 18px rgba(15,23,42,0.04);
    color: #d97706;
    font-size: 24px;
  }

  .pending-card__info {
    flex: 1;
    min-width: 0;
  }

  .pending-card__name {
    font-size: 18px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .pending-card__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 999px;
    background: #fef3c7;
    color: #92400e;
  }

  .pending-card__details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .pending-card__detail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: white;
    border-radius: 14px;
    border: 1px solid rgba(226,232,240,0.9);
  }

  .pending-card__detail-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
  }

  .pending-card__detail-value {
    font-size: 14px;
    font-weight: 800;
    color: #0f172a;
  }

  .pending-card__actions {
    display: flex;
    gap: 12px;
  }

  .pending-card__btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 14px 20px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 800;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .pending-card__btn--approve {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    box-shadow: 0 4px 12px rgba(16,185,129,0.25);
  }

  .pending-card__btn--approve:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16,185,129,0.35);
  }

  .pending-card__btn--reject {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 4px 12px rgba(239,68,68,0.25);
  }

  .pending-card__btn--reject:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(239,68,68,0.35);
  }

  .pending-empty {
    text-align: center;
    padding: 80px 40px;
    background: linear-gradient(180deg, #ffffff 0%, #fffbeb 100%);
    border-radius: 28px;
    box-shadow: 0 14px 30px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(226,232,240,0.9);
  }

  .pending-empty__icon {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    background: linear-gradient(135deg, #f1f5f9, #e2e8f0);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    color: #94a3b8;
    font-size: 36px;
  }

  .pending-empty__title {
    font-size: 22px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .pending-empty__subtitle {
    color: #64748b;
    font-size: 15px;
    font-weight: 600;
  }

  .pending-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px;
  }

  .pending-loading__spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(245,158,11,0.2);
    border-top-color: #f59e0b;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .pending-error {
    background: linear-gradient(135deg, #fee2e2, #fef2f2);
    border: 1.5px solid #fecaca;
    border-radius: 20px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: #dc2626;
  }

  .pending-error__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: rgba(220,38,38,0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }

  .rejection-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(4px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .rejection-modal {
    background: linear-gradient(135deg, #1e293b, #0f172a);
    border-radius: 24px;
    padding: 32px;
    width: 100%;
    max-width: 480px;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
  }

  .rejection-modal__title {
    font-size: 20px;
    font-weight: 900;
    color: white;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .rejection-modal__subtitle {
    color: rgba(255,255,255,0.6);
    font-size: 14px;
    margin-bottom: 24px;
  }

  .rejection-modal__textarea {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 16px;
    color: white;
    font-family: 'Cairo', sans-serif;
    font-size: 14px;
    resize: none;
    min-height: 120px;
    margin-bottom: 24px;
  }

  .rejection-modal__textarea:focus {
    outline: none;
    border-color: #ef4444;
  }

  .rejection-modal__actions {
    display: flex;
    gap: 12px;
  }

  .rejection-modal__btn {
    flex: 1;
    padding: 14px 24px;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 800;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .rejection-modal__btn--cancel {
    background: rgba(255,255,255,0.1);
    color: white;
  }

  .rejection-modal__btn--confirm {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
  }
`;

const PendingChildrenTab = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Check if user is admin
  // useEffect(() => {
  //   const checkAdmin = () => {
  //     const userData = localStorage.getItem('user_data') || localStorage.getItem('madeena_login_user_response');
  //     if (userData) {
  //       try {
  //         const parsed = JSON.parse(userData);
          
  //         // Robust admin check
  //         const roles = parsed.roles || parsed.role || (parsed.user?.roles) || [];
  //         const isAdminRole = Array.isArray(roles) 
  //           ? roles.some(r => String(r).toLowerCase() === 'admin')
  //           : String(roles).toLowerCase() === 'admin';
            
  //         setIsAdmin(isAdminRole || parsed.isAdmin || false);
  //       } catch (e) {
  //         console.warn('Failed to parse user data for admin check');
  //       }
  //     }
  //   };
  //   checkAdmin();
  // }, []);
// Check if user is admin
useEffect(() => {
  const checkAdmin = () => {
    try {
      const possibleUserKeys = [
        'user_data',
        'madeena_login_user_response',
        'user',
        'auth_user',
        'login_response'
      ];

      let parsed = null;

      for (const key of possibleUserKeys) {
        const value = localStorage.getItem(key);
        if (value) {
          parsed = JSON.parse(value);
          break;
        }
      }

      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('access_token') ||
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.access_token ||
        parsed?.data?.token ||
        parsed?.data?.accessToken;

      let tokenPayload = {};

      if (token) {
        try {
          const base64Payload = token.split('.')[1];
          tokenPayload = JSON.parse(atob(base64Payload));
        } catch (e) {
          console.warn('Failed to decode token');
        }
      }

      const roles = [
        parsed?.role,
        parsed?.roles,
        parsed?.user?.role,
        parsed?.user?.roles,
        parsed?.data?.role,
        parsed?.data?.roles,
        tokenPayload?.role,
        tokenPayload?.roles,
        tokenPayload?.Role,
        tokenPayload?.Roles,
        tokenPayload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      ]
        .flat()
        .filter(Boolean)
        .map(r => String(r).toLowerCase());

      const isAdminRole =
        roles.includes('admin') ||
        roles.includes('administrator') ||
        parsed?.isAdmin === true ||
        parsed?.user?.isAdmin === true ||
        parsed?.data?.isAdmin === true;

      setIsAdmin(isAdminRole);
    } catch (e) {
      console.warn('Failed to parse user data for admin check', e);
      setIsAdmin(false);
    }
  };

  checkAdmin();
}, []);
  const fetchPendingChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await childrenService.getPendingChildren();
      setChildren(response);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في جلب الطلبات المعلقة');
      console.error('Error fetching pending children:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPendingChildren();
    }
  }, [isAdmin]);

  const handleApprove = async (childId) => {
    try {
      await childrenService.approveChild(childId);
      alert('تمت الموافقة على الطفل بنجاح');
      fetchPendingChildren();
    } catch (err) {
      console.error('Error approving child:', err);
      let errorMessage = 'فشل في الموافقة على الطفل';
      if (err.response?.data?.message) {
        errorMessage = `خطأ: ${err.response.data.message}`;
      } else if (err.response?.data?.error) {
        errorMessage = `خطأ: ${err.response.data.error}`;
      } else if (err.message) {
        errorMessage = `خطأ: ${err.message}`;
      }
      alert(errorMessage);
    }
  };

  const openRejectionModal = (child) => {
    setSelectedChild(child);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const handleReject = async () => {
    if (!selectedChild) return;

    try {
      await childrenService.rejectChild(selectedChild.id, rejectionReason);
      setShowRejectionModal(false);
      setSelectedChild(null);
      setRejectionReason('');
      alert('تم رفض الطفل بنجاح');
      fetchPendingChildren();
    } catch (err) {
      console.error('Error rejecting child:', err);
      let errorMessage = 'فشل في رفض الطفل';
      if (err.response?.data?.message) {
        errorMessage = `خطأ: ${err.response.data.message}`;
      } else if (err.response?.data?.error) {
        errorMessage = `خطأ: ${err.response.data.error}`;
      } else if (err.message) {
        errorMessage = `خطأ: ${err.message}`;
      }
      alert(errorMessage);
    }
  };

  if (!isAdmin) {
    return (
      <div className="pending-children-tab">
        <style>{PENDING_CSS}</style>
        <div className="pending-error">
          <div className="pending-error__icon">
            <FaUserShield />
          </div>
          <div>
            <h3 className="font-black text-lg mb-1">غير مصرح</h3>
            <p className="font-semibold">هذه الصفحة متاحة للمسؤولين فقط</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pending-children-tab">
      <style>{PENDING_CSS}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pending-header"
      >
        <div className="pending-header__icon">
          <FaClock />
        </div>
        <div>
          <h1 className="pending-header__title">الطلبات الواردة</h1>
          <p className="pending-header__subtitle">إدارة طلبات تسجيل الأطفال المعلقة</p>
        </div>

        <div className="pending-header__count">
          {children.length} طلب معلق
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="pending-loading">
          <div className="pending-loading__spinner" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="pending-error"
        >
          <div className="pending-error__icon">
            <FaExclamationTriangle />
          </div>
          <div>
            <h3 className="font-black text-lg mb-1">حدث خطأ</h3>
            <p className="font-semibold">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Children Grid */}
      {!loading && !error && (
        <>
          {children.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pending-empty"
            >
              <div className="pending-empty__icon">
                <FaCheckCircle />
              </div>
              <h3 className="pending-empty__title">لا توجد طلبات معلقة</h3>
              <p className="pending-empty__subtitle">
                جميع طلبات التسجيل تمت معالجتها
              </p>
            </motion.div>
          ) : (
            <div className="pending-grid">
              <AnimatePresence>
                {children.map((child, index) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="pending-card"
                  >
                    <div className="pending-card__header">
                      <div className="pending-card__icon">
                        <FaBaby />
                      </div>
                      <div className="pending-card__info">
                        <h3 className="pending-card__name">{child.fullName}</h3>
                        <span className="pending-card__status">
                          <FaClock />
                          قيد الانتظار
                        </span>
                      </div>
                    </div>

                    <div className="pending-card__details">
                      <div className="pending-card__detail">
                        <span className="pending-card__detail-label">
                          <FaUser className="text-blue-500" />
                          ولي الأمر
                        </span>
                        <span className="pending-card__detail-value">
                          {child.parentName || child.parentId || 'غير محدد'}
                        </span>
                      </div>

                      <div className="pending-card__detail">
                        <span className="pending-card__detail-label">
                          <FaCoins className="text-yellow-500" />
                          الحد اليومي
                        </span>
                        <span className="pending-card__detail-value">
                          {child.dailyLimit} جنيه
                        </span>
                      </div>

                      <div className="pending-card__detail">
                        <span className="pending-card__detail-label">
                          <FaHeart className="text-rose-500" />
                          السماح بالتبرعات
                        </span>
                        <span className="pending-card__detail-value">
                          {child.allowDonations ? 'نعم' : 'لا'}
                        </span>
                      </div>

                      {child.createdAt && (
                        <div className="pending-card__detail">
                          <span className="pending-card__detail-label">
                            <FaCalendar className="text-purple-500" />
                            تاريخ الطلب
                          </span>
                          <span className="pending-card__detail-value">
                            {new Date(child.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pending-card__actions">
                      <button
                        className="pending-card__btn pending-card__btn--approve"
                        onClick={() => handleApprove(child.id)}
                      >
                        <FaCheckCircle />
                        قبول
                      </button>
                      <button
                        className="pending-card__btn pending-card__btn--reject"
                        onClick={() => openRejectionModal(child)}
                      >
                        <FaTimesCircle />
                        رفض
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="rejection-modal-overlay" onClick={() => setShowRejectionModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rejection-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="rejection-modal__title">
              <FaTimesCircle className="text-red-500" />
              رفض الطفل
            </h3>
            <p className="rejection-modal__subtitle">
              {selectedChild?.fullName}
            </p>

            <textarea
              className="rejection-modal__textarea"
              placeholder="أدخل سبب الرفض..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              dir="rtl"
            />

            <div className="rejection-modal__actions">
              <button
                className="rejection-modal__btn rejection-modal__btn--cancel"
                onClick={() => {
                  setShowRejectionModal(false);
                  setSelectedChild(null);
                  setRejectionReason('');
                }}
              >
                إلغاء
              </button>
              <button
                className="rejection-modal__btn rejection-modal__btn--confirm"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                تأكيد الرفض
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default memo(PendingChildrenTab);
