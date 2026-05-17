// src/components/tabs/PartnersTab.jsx
/**
 * PartnersTab — Admin-only management of partner organizations.
 * Full CRUD operations with real API integration.
 */
import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { partnersService } from '../../services/partnersService';
import AddPartnerModal from '../modals/AddPartnerModal';
import PartnerDetailModal from '../modals/PartnerDetailModal';
import EditPartnerModal from '../modals/EditPartnerModal';
import EntityHistoryModal from '../modals/EntityHistoryModal';

import {
  FaBuilding,
  FaPlus,
  FaSearch,
  FaEye,
  FaHistory,
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaIndustry,
  FaArrowRight,
  FaArrowLeft,
  FaExclamationTriangle,
  FaUserShield,
  FaHandshake
} from 'react-icons/fa';

const PARTNER_CSS = `
  .partners-tab {
    direction: rtl;
    display: grid;
    gap: 24px;
    font-family: 'Cairo', sans-serif;
    color: #0f172a;
    padding: 24px;
  }

  .partners-header {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.6);
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.92) 100%);
    backdrop-filter: blur(20px);
    padding: 28px 32px;
    box-shadow: rgba(15, 23, 42, 0.4) 0px 20px 50px -20px, rgba(255, 255, 255, 0.4) 0px 0px 0px 1px inset;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }

  .partners-header__content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .partners-header__icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #dbeafe, #dcfce7);
    color: #2563eb;
    font-size: 28px;
    box-shadow: 0 12px 24px rgba(59,130,246,0.12);
  }

  .partners-header__title {
    font-size: 28px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 4px;
  }

  .partners-header__subtitle {
    color: #64748b;
    font-size: 14px;
    font-weight: 600;
  }

  .partners-controls {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .partners-search {
    position: relative;
  }

  .partners-search__input {
    width: 280px;
    padding: 14px 48px 14px 20px;
    border-radius: 16px;
    border: 1.5px solid rgba(226,232,240,0.9);
    background: white;
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    transition: all 0.2s ease;
    font-family: 'Cairo', sans-serif;
  }

  .partners-search__input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
  }

  .partners-search__icon {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #94a3b8;
    font-size: 18px;
  }

  .partners-add-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 24px;
    border-radius: 16px;
    background: linear-gradient(135deg, #3b82f6, #2563eb);
    color: white;
    font-size: 15px;
    font-weight: 800;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 8px 20px rgba(59,130,246,0.25);
  }

  .partners-add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(59,130,246,0.35);
  }

  .partners-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
  }

  .partner-card {
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 24px;
    padding: 24px;
    box-shadow: 0 14px 30px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(226,232,240,0.9);
    transition: all 0.2s ease;
  }

  .partner-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 18px 34px rgba(15,23,42,0.08);
  }

  .partner-card__header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
  }

  .partner-card__icon {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #dbeafe, #dcfce7);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(226,232,240,0.9);
    box-shadow: 0 8px 18px rgba(15,23,42,0.04);
    color: #2563eb;
    font-size: 24px;
  }

  .partner-card__info {
    flex: 1;
    min-width: 0;
  }

  .partner-card__title {
    font-size: 18px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 6px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .partner-card__type {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #64748b;
  }

  .partner-card__details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  .partner-card__detail {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
    min-width: 0;
  }

  .partner-card__detail span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .partner-card__detail-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    font-size: 16px;
    flex-shrink: 0;
  }

  .partner-card__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    border-top: 1px solid rgba(226,232,240,0.9);
    padding-top: 16px;
  }

  .partner-card__btn {
    flex: 1;
    min-width: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 700;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .partner-card__btn--view {
    background: #eff6ff;
    color: #2563eb;
  }

  .partner-card__btn--view:hover {
    background: #dbeafe;
  }

  .partner-card__btn--edit {
    background: #fef3c7;
    color: #d97706;
  }

  .partner-card__btn--edit:hover {
    background: #fde68a;
  }

  .partner-card__btn--delete {
    background: #fee2e2;
    color: #dc2626;
  }

  .partner-card__btn--delete:hover {
    background: #fecaca;
  }

  .partners-empty {
    text-align: center;
    padding: 80px 40px;
    background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
    border-radius: 28px;
    box-shadow: 0 14px 30px rgba(15,23,42,0.05);
    border: 1.5px solid rgba(226,232,240,0.9);
  }

  .partners-empty__icon {
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

  .partners-empty__title {
    font-size: 22px;
    font-weight: 900;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .partners-empty__subtitle {
    color: #64748b;
    font-size: 15px;
    font-weight: 600;
  }

  .partners-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 80px;
  }

  .partners-loading__spinner {
    width: 48px;
    height: 48px;
    border: 3px solid rgba(59,130,246,0.2);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .partners-error {
    background: linear-gradient(135deg, #fee2e2, #fef2f2);
    border: 1.5px solid #fecaca;
    border-radius: 20px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    color: #dc2626;
  }

  .partners-error__icon {
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

  .partners-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }

  .partners-pagination__btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-radius: 12px;
    background: white;
    border: 1.5px solid rgba(226,232,240,0.9);
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .partners-pagination__btn:hover:not(:disabled) {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .partners-pagination__btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .partners-pagination__info {
    font-size: 14px;
    font-weight: 700;
    color: #64748b;
  }

  .partners-admin-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 999px;
    background: linear-gradient(135deg, #dbeafe, #dcfce7);
    color: #2563eb;
    font-size: 13px;
    font-weight: 800;
  }

  @media (max-width: 640px) {
    .partners-tab {
      padding: 16px;
      gap: 16px;
    }

    .partners-header {
      padding: 20px;
      flex-direction: column;
      align-items: stretch;
    }

    .partners-controls {
      flex-direction: column;
    }

    .partners-search {
      width: 100%;
    }

    .partners-search__input {
      width: 100%;
    }

    .partners-add-btn {
      width: 100%;
      justify-content: center;
    }

    .partners-grid {
      grid-template-columns: 1fr;
    }

    .partner-card {
      padding: 20px;
      border-radius: 20px;
    }

    .partner-card__actions {
      flex-wrap: wrap;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .partner-card__btn {
      padding: 10px;
      font-size: 12px;
    }

    .partner-card__title {
      font-size: 16px;
    }
  }
`;

const PartnersTab = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [historyEntityId, setHistoryEntityId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = () => {
      const userData = localStorage.getItem('user_data') || localStorage.getItem('madeena_login_user_response');
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          
          // Robust admin check
          const roles = parsed.roles || parsed.role || (parsed.user?.roles) || [];
          const isAdminRole = Array.isArray(roles) 
            ? roles.some(r => String(r).toLowerCase() === 'admin')
            : String(roles).toLowerCase() === 'admin';
            
          setIsAdmin(isAdminRole || parsed.isAdmin || false);
        } catch (e) {
          console.warn('Failed to parse user data for admin check');
        }
      }
    };
    checkAdmin();
  }, []);

  const fetchPartners = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);

      const response = search
        ? await partnersService.searchPartners(search, page, pageSize)
        : await partnersService.getPartners(page, pageSize);

      setPartners(response.data);
      setTotalPages(response.pagination.totalPages || 1);
      setCurrentPage(response.pagination.currentPage || page);
    } catch (err) {
      setError(err.response?.data?.message || 'فشل في جلب المؤسسات');
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleAddPartner = async (partnerData) => {
    try {
      await partnersService.createPartner(partnerData);
      setShowAddModal(false);
      fetchPartners(currentPage, searchTerm);
      alert('تم إضافة المؤسسة بنجاح');
    } catch (err) {
      console.error('Error adding partner:', err);
      const apiData = err.response?.data;
      let errorMsg = 'فشل في إضافة المؤسسة.';
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

  const handleViewPartner = async (partnerId) => {
    try {
      const partner = await partnersService.getPartnerById(partnerId);
      setSelectedPartner(partner);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching partner details:', err);
      alert('فشل في جلب تفاصيل المؤسسة');
    }
  };

  const handleEditPartner = (partner) => {
    setSelectedPartner(partner);
    setShowEditModal(true);
  };

  const handleUpdatePartner = async (partnerId, partnerData) => {
    try {
      await partnersService.updatePartner(partnerId, partnerData);
      setShowEditModal(false);
      setSelectedPartner(null);
      fetchPartners(currentPage, searchTerm);
      alert('تم تحديث المؤسسة بنجاح');
    } catch (err) {
      console.error('Error updating partner:', err);
      let errorMessage = 'فشل في تحديث المؤسسة';
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

  const handleDeletePartner = async (partnerId) => {
    const confirmed = window.confirm('هل أنت متأكد من حذف هذه المؤسسة؟ هذا الإجراء لا يمكن التراجع عنه.');
    if (!confirmed) return;

    try {
      await partnersService.deletePartner(partnerId);
      alert('تم حذف المؤسسة بنجاح');
      fetchPartners(currentPage, searchTerm);
    } catch (err) {
      console.error('Error deleting partner:', err);
      let errorMessage = 'فشل في حذف المؤسسة';
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

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const getOrgTypeLabel = (type) => {
    const types = {
      1: 'مؤسسة تجارية',
      2: 'مؤسسة خيرية',
      3: 'مؤسسة حكومية',
      4: 'مؤسسة تعليمية'
    };
    return types[type] || 'مؤسسة';
  };

  if (!isAdmin) {
    return (
      <div className="partners-tab">
        <style>{PARTNER_CSS}</style>
        <div className="partners-error">
          <div className="partners-error__icon">
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
    <div className="partners-tab" style={{ background: 'transparent' }}>
      <style>{PARTNER_CSS}</style>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="partners-header"
      >
        <div className="partners-header__content">
          <div className="partners-header__icon">
            <FaBuilding />
          </div>
          <div>
            <h1 className="partners-header__title">إدارة المؤسسات</h1>
            <p className="partners-header__subtitle">إدارة الشركاء والمؤسسات المتعاونة</p>
          </div>
        </div>

        <div className="partners-controls">
          <div className="partners-search">
            <FaSearch className="partners-search__icon" />
            <input
              type="text"
              className="partners-search__input"
              placeholder="البحث في المؤسسات..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="partners-add-btn"
            onClick={() => setShowAddModal(true)}
          >
            <FaPlus />
            إضافة مؤسسة
          </motion.button>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="partners-loading">
          <div className="partners-loading__spinner" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="partners-error"
        >
          <div className="partners-error__icon">
            <FaExclamationTriangle />
          </div>
          <div>
            <h3 className="font-black text-lg mb-1">حدث خطأ</h3>
            <p className="font-semibold">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Partners Grid */}
      {!loading && !error && (
        <>
          {partners.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="partners-empty"
            >
              <div className="partners-empty__icon">
                <FaHandshake />
              </div>
              <h3 className="partners-empty__title">لا توجد مؤسسات</h3>
              <p className="partners-empty__subtitle">
                {searchTerm ? 'لا توجد نتائج للبحث' : 'ابدأ بإضافة مؤسسة جديدة'}
              </p>
            </motion.div>
          ) : (
            <div className="partners-grid">
              <AnimatePresence>
                {partners.map((partner, index) => (
                  <motion.div
                    key={partner.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="partner-card"
                  >
                    <div className="partner-card__header">
                      <div className="partner-card__icon">
                        <FaBuilding />
                      </div>
                      <div className="partner-card__info">
                        <h3 className="partner-card__title">{partner.orgName}</h3>
                        <span className="partner-card__type">
                          <FaIndustry />
                          {getOrgTypeLabel(partner.orgType)}
                        </span>
                      </div>
                    </div>

                    <div className="partner-card__details">
                      {partner.phoneNumber && (
                        <div className="partner-card__detail">
                          <div className="partner-card__detail-icon">
                            <FaPhone />
                          </div>
                          <span>{partner.phoneNumber}</span>
                        </div>
                      )}
                      {partner.email && (
                        <div className="partner-card__detail">
                          <div className="partner-card__detail-icon">
                            <FaEnvelope />
                          </div>
                          <span>{partner.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="partner-card__actions">
                      <button
                        className="partner-card__btn partner-card__btn--view"
                        onClick={() => handleViewPartner(partner.id)}
                      >
                        <FaEye />
                        عرض
                      </button>
                      <button
                        className="partner-card__btn partner-card__btn--view"
                        onClick={() => setHistoryEntityId(partner.id)}
                      >
                        <FaHistory />
                        History
                      </button>
                      <button
                        className="partner-card__btn partner-card__btn--edit"
                        onClick={() => handleEditPartner(partner)}
                      >
                        <FaEdit />
                        تعديل
                      </button>
                      <button
                        className="partner-card__btn partner-card__btn--delete"
                        onClick={() => handleDeletePartner(partner.id)}
                      >
                        <FaTrash />
                        حذف
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {partners.length > 0 && totalPages > 1 && (
            <div className="partners-pagination">
              <button
                className="partners-pagination__btn"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
              >
                <FaArrowRight />
                السابق
              </button>
              <span className="partners-pagination__info">
                صفحة {currentPage} من {totalPages}
              </span>
              <button
                className="partners-pagination__btn"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
              >
                التالي
                <FaArrowLeft />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <AddPartnerModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPartner}
      />

      <PartnerDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPartner(null);
        }}
        partner={selectedPartner}
      />

      <EditPartnerModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPartner(null);
        }}
        onSubmit={handleUpdatePartner}
        partner={selectedPartner}
      />

      <EntityHistoryModal
        isOpen={Boolean(historyEntityId)}
        entityId={historyEntityId}
        title="سجل المؤسسة"
        onClose={() => setHistoryEntityId(null)}
      />
    </div>
  );
};

export default memo(PartnersTab);
