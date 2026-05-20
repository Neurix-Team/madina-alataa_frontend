// src/components/tabs/MyChildrenTab.jsx
/**
 * MyChildrenTab — Regular users can view and add their children.
 */
import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { childrenService } from '../../services/childrenService';
import AddChildModal from '../modals/AddChildModal';

import {
  FaChild,
  FaPlus,
  FaHeart,
  FaCoins,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBaby
} from 'react-icons/fa';

const CHILDREN_CSS = `
  .my-children-tab {
    direction: rtl;
    display: grid;
    gap: 24px;
    font-family: 'Cairo', sans-serif;
    color: var(--text-primary);
    padding: 24px;
  }

  .children-header {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    border: 1px solid var(--glass-border);
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    padding: 28px 32px;
    box-shadow: var(--shadow-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }

  .children-header__content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .children-header__icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-card-2);
    color: var(--primary);
    font-size: 28px;
    box-shadow: var(--shadow-sm);
    border: 1px solid var(--border);
  }

  .children-header__title {
    font-size: 28px;
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .children-header__subtitle {
    color: var(--text-secondary);
    font-size: 14px;
    font-weight: 600;
  }

  .children-add-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
    border-radius: 16px;
    background: linear-gradient(135deg, #ec4899, #db2777);
    color: white;
    font-size: 15px;
    font-weight: 800;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 8px 20px rgba(236,72,153,0.25);
  }

  .children-add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(236,72,153,0.35);
  }

  .children-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 20px;
  }

  .child-card {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border-radius: 24px;
    padding: 24px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--glass-border);
    transition: all 0.2s ease;
  }

  .child-card:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }

  .child-card__header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .child-card__icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    flex-shrink: 0;
    background: var(--bg-card-2);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    color: var(--primary);
    font-size: 24px;
  }

  .child-card__info {
    flex: 1;
    min-width: 0;
  }

  .child-card__name {
    font-size: 18px;
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .child-card__status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 999px;
  }

  .child-card__status--approved {
    background: #dcfce7;
    color: #166534;
  }

  .child-card__status--pending {
    background: #fef3c7;
    color: #92400e;
  }

  .child-card__status--rejected {
    background: #fee2e2;
    color: #dc2626;
  }

  .child-card__details {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .child-card__detail {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--bg-card-2);
    border-radius: 14px;
    border: 1px solid var(--border);
  }

  .child-card__detail-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 600;
  }

  .child-card__detail-value {
    font-size: 15px;
    font-weight: 800;
    color: var(--text-primary);
  }

  .children-empty {
    text-align: center;
    padding: 80px 40px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    border-radius: 28px;
    box-shadow: var(--shadow-md);
    border: 1px solid var(--glass-border);
  }

  .children-empty__icon {
    width: 80px;
    height: 80px;
    border-radius: 24px;
    background: var(--bg-card-2);
    border: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    color: var(--primary);
    font-size: 36px;
  }

  .children-empty__title {
    font-size: 22px;
    font-weight: 900;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .children-empty__subtitle {
    color: var(--text-secondary);
    font-size: 15px;
    font-weight: 600;
  }

  .children-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px;
  }

  .children-loading__spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(236,72,153,0.2);
    border-top-color: #ec4899;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .children-error {
    background: linear-gradient(135deg, #fee2e2, #fef2f2);
    border: 1.5px solid #fecaca;
    border-radius: 20px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: #dc2626;
  }

  .children-error__icon {
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

  [data-theme="dark"] .my-children-tab,
  [data-theme="dark"] .children-header,
  [data-theme="dark"] .child-card,
  [data-theme="dark"] .child-card__detail,
  [data-theme="dark"] .children-empty {
    background: var(--glass-bg) !important;
    backdrop-filter: var(--glass-blur);
    border-color: var(--border) !important;
    color: var(--text-primary) !important;
  }

  [data-theme="dark"] .child-card__status--approved {
    background: rgba(16, 185, 129, 0.16);
    color: #a7f3d0;
  }

  [data-theme="dark"] .child-card__status--pending {
    background: rgba(250, 204, 21, 0.16);
    color: #facc15;
  }

  [data-theme="dark"] .child-card__status--rejected {
    background: rgba(248, 113, 113, 0.16);
    color: #fecaca;
  }

  @media (max-width: 640px) {
    .my-children-tab {
      padding: 12px;
      gap: 16px;
    }

    .children-header {
      padding: 20px;
      flex-direction: column;
      text-align: center;
    }

    .children-header__content {
      flex-direction: column;
      gap: 12px;
    }

    .children-header__title {
      font-size: 22px;
    }

    .children-add-btn {
      width: 100%;
      justify-content: center;
    }

    .children-grid {
      grid-template-columns: 1fr;
    }

    .child-card {
      padding: 16px;
    }

    .child-card__header {
      flex-direction: column;
      text-align: center;
      gap: 12px;
    }

    .child-card__icon {
      margin: 0 auto;
    }

    .children-empty {
      padding: 40px 20px;
    }
  }
`;

const MyChildrenTab = () => {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchMyChildren = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await childrenService.getMyChildren();
      setChildren(response);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('عذراً، ليس لديك صلاحية للوصول إلى هذه الصفحة. قد تكون هذه الميزة غير متاحة لحساب المسؤول (Admin).');
      } else {
        setError(err.response?.data?.message || 'فشل في جلب الأطفال');
      }
      console.error('Error fetching children:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyChildren();
  }, []);

  const handleAddChild = async (childData) => {
    try {
      await childrenService.createChild(childData);
      setShowAddModal(false);
      fetchMyChildren();
      alert('تم إضافة الطفل بنجاح');
    } catch (err) {
      console.error('Error adding child:', err);
      const apiData = err.response?.data;
      let errorMsg = 'فشل في إضافة الطفل.';
      if (apiData?.errors) {
        const messages = Object.values(apiData.errors).flat().join('\n');
        errorMsg += `\nالأخطاء:\n${messages}`;
      } else if (apiData?.detail) {
        errorMsg += `\n${apiData.detail}`;
      } else if (apiData?.message) {
        errorMsg += `\n${apiData.message}`;
      } else if (apiData?.error) {
        errorMsg += `\n${apiData.error}`;
      } else if (err.message) {
        errorMsg += `\n${err.message}`;
      }
      alert(errorMsg);
      setError(errorMsg);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <FaCheckCircle />;
      case 'pending':
        return <FaClock />;
      case 'rejected':
        return <FaTimesCircle />;
      default:
        return <FaClock />;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'child-card__status--approved';
      case 'pending':
        return 'child-card__status--pending';
      case 'rejected':
        return 'child-card__status--rejected';
      default:
        return 'child-card__status--pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'تمت الموافقة';
      case 'pending':
        return 'قيد الانتظار';
      case 'rejected':
        return 'تم الرفض';
      default:
        return 'قيد الانتظار';
    }
  };

  return (
    <div className="my-children-tab">
      <style>{CHILDREN_CSS}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="children-header"
      >
        <div className="children-header__content">
          <div className="children-header__icon">
            <FaBaby />
          </div>
          <div>
            <h1 className="children-header__title">أطفالي</h1>
            <p className="children-header__subtitle">إدارة أطفالك والتبرعات لهم</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="children-add-btn"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus />
          إضافة طفل
        </motion.button>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="children-loading">
          <div className="children-loading__spinner" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="children-error"
        >
          <div className="children-error__icon">
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
              className="children-empty"
            >
              <div className="children-empty__icon">
                <FaChild />
              </div>
              <h3 className="children-empty__title">لا يوجد أطفال</h3>
              <p className="children-empty__subtitle">
                ابدأ بإضافة طفل جديد
              </p>
            </motion.div>
          ) : (
            <div className="children-grid">
              <AnimatePresence>
                {children.map((child, index) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="child-card"
                  >
                    <div className="child-card__header">
                      <div className="child-card__icon">
                        <FaChild />
                      </div>
                      <div className="child-card__info">
                        <h3 className="child-card__name">{child.fullName}</h3>
                        <span className={`child-card__status ${getStatusClass(child.status)}`}>
                          {getStatusIcon(child.status)}
                          {getStatusLabel(child.status)}
                        </span>
                      </div>
                    </div>

                    <div className="child-card__details">
                      <div className="child-card__detail">
                        <span className="child-card__detail-label">
                          <FaCoins className="text-yellow-500" />
                          الحد اليومي
                        </span>
                        <span className="child-card__detail-value">
                          {child.dailyLimit} جنيه
                        </span>
                      </div>

                      <div className="child-card__detail">
                        <span className="child-card__detail-label">
                          <FaHeart className="text-rose-500" />
                          السماح بالتبرعات
                        </span>
                        <span className="child-card__detail-value">
                          {child.allowDonations ? 'نعم' : 'لا'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddChild}
      />
    </div>
  );
};

export default memo(MyChildrenTab);
