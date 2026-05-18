import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  FaHandHoldingHeart,
  FaCheck,
  FaEye,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaBuilding,
  FaDonate,
  FaPlus,
} from 'react-icons/fa';
import { donationRequestsService, normalizeDonationRequestsListResponse } from '../services/donationRequestsService';
import { donationOrdersService } from '../services/donationOrdersService';
import ViewDonationRequestModal from '../components/modals/ViewDonationRequestModal';
import EditDonationRequestModal from '../components/modals/EditDonationRequestModal';

import CreateDonationRequestModal from '../components/modals/CreateDonationRequestModal';
import { showAppConfirm } from '../utils/appAlerts';
import { locationsService } from '../services/locationsService';

const UserDonationRequestsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const isApprovedRoute = location.pathname === '/approved-donation-requests';
  const isAdmin = user?.roles?.some((role) => String(role).toLowerCase() === 'admin');
  const [activeTab, setActiveTab] = useState(isApprovedRoute ? 'approved' : 'my');
  const [myRequests, setMyRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [apiResponse, setApiResponse] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [locations, setLocations] = useState([]);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [selectedRequestForDonation, setSelectedRequestForDonation] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'my') {
        const response = await donationRequestsService.getMyDonationRequests(pageNumber, pageSize);
        const normalized = normalizeDonationRequestsListResponse(response);
        console.log('DONATION REQUESTS USER RAW RESPONSE:', normalized.raw);
        setApiResponse(normalized.raw);
        setMyRequests(normalized.items);
        setTotalCount(normalized.totalCount);
      } else {
        const response = await donationRequestsService.getApprovedDonationRequests(pageNumber, pageSize);
        const normalized = normalizeDonationRequestsListResponse(response);
        console.log('DONATION REQUESTS APPROVED RAW RESPONSE:', normalized.raw);
        setApiResponse(normalized.raw);
        setApprovedRequests(normalized.items);
        setTotalCount(normalized.totalCount);
      }
    } catch (err) {
      console.error('Error fetching donation requests:', err);
      setError(err.message || 'فشل في جلب طلبات التبرع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab, pageNumber, pageSize]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await locationsService.getAllLocations(1, 1000);
        setLocations(data.items || []);
      } catch (err) {
        console.error('Error fetching locations:', err);
      }
    };
    if (isAdmin) fetchLocations();
  }, [isAdmin]);

  useEffect(() => {
    setActiveTab(isApprovedRoute ? 'approved' : 'my');
  }, [isApprovedRoute]);

  const totalPages = useMemo(() => Math.ceil(totalCount / pageSize), [totalCount, pageSize]);
  const currentRequests = activeTab === 'my' ? myRequests : approvedRequests;
  const locationNameById = useMemo(() => {
    return locations.reduce((accumulator, item) => {
      const locationId = item?.id || item?.locationId || item?.Id || item?.LocationId;
      if (locationId) {
        accumulator[locationId] = item?.name || item?.title || item?.Name || 'موقع الطلب';
      }
      return accumulator;
    }, {});
  }, [locations]);

  const handleDelete = async (id) => {
    const confirmed = await showAppConfirm({
      title: 'حذف الطلب',
      message: 'هل أنت متأكد من حذف هذا الطلب؟',
      type: 'danger',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
    });
    if (!confirmed) return;
    setActionLoading((prev) => ({ ...prev, [id]: 'delete' }));
    try {
      await donationRequestsService.deleteDonationRequest(id);
      await fetchRequests();
    } catch (err) {
      console.error('Error deleting request:', err);
      alert(err.message || 'فشل في حذف الطلب');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsViewModalOpen(true);
  };

  const handleCreateSuccess = async () => {
    setIsCreateModalOpen(false);
    await fetchRequests();
  };

  const handleEdit = (request) => {
    setSelectedRequest(request);
    setIsEditModalOpen(true);
  };

  const handleDonate = (request) => {
    setSelectedRequestForDonation(request);
    setIsDonateModalOpen(true);
  };

  const handleDonateFromDetails = (request) => {
    setIsViewModalOpen(false);
    setSelectedRequest(request);
    setSelectedRequestForDonation(request);
    setIsDonateModalOpen(true);
  };

  const getUrgencyLabel = (level) => {
    const levels = {
      1: { label: 'منخفض', color: 'text-green-400', bg: 'bg-green-500/20' },
      2: { label: 'متوسط', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
      3: { label: 'عالي', color: 'text-orange-400', bg: 'bg-orange-500/20' },
      4: { label: 'حرج', color: 'text-red-400', bg: 'bg-red-500/20' },
      5: { label: 'طارئ', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    };
    return levels[level] || { label: 'درجة الاستعجال', color: 'text-gray-400', bg: 'bg-gray-500/20' };
  };

  return (
    <div className="donation-requests-page p-6">
      <div className="donation-requests-page__container">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="donation-requests-page__hero">
          <div className="donation-requests-page__heroGroup">
            <div className="donation-requests-page__heroIcon">
              <FaHandHoldingHeart />
            </div>
            <div className="donation-requests-page__heroText">
              <h1 className="donation-requests-page__heroTitle">طلبات التبرع</h1>
              <p className="donation-requests-page__heroSubtitle">إدارة الطلبات الخاصة بك والطلبات المقبولة من نفس الواجهة.</p>
            </div>
          </div>
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="pro-btn pro-btn-primary"
              style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', padding: '12px 24px', borderRadius: '14px', border: 'none', color: '#fff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <FaPlus />
              <span>إضافة طلب تبرع</span>
            </motion.button>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="donation-requests-page__tabs">
          <button
            onClick={() => {
              setActiveTab('my');
              setPageNumber(1);
            }}
            className={`donation-requests-page__tabBtn ${activeTab === 'my' ? 'is-active' : ''}`}
          >
            <FaHandHoldingHeart />
            <span>طلباتي</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('approved');
              setPageNumber(1);
            }}
            className={`donation-requests-page__tabBtn ${activeTab === 'approved' ? 'is-active is-successActive' : ''}`}
          >
            <FaCheck />
            <span>الطلبات المقبولة</span>
          </button>
        </motion.div>

        
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="donation-requests-page__alert">
            <FaExclamationTriangle />
            <p>{error}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="donation-requests-page__loading">
            <div className="mission-page__emptyIcon">
              <FaSpinner className="animate-spin" />
            </div>
            <h3 className="donation-requests-page__emptyTitle">جاري تحميل الطلبات</h3>
            <p className="donation-requests-page__emptyText">يتم تجهيز السجل الحالي.</p>
          </div>
        ) : currentRequests.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="donation-requests-page__empty">
            <div className="donation-requests-page__emptyIcon">
              <FaHandHoldingHeart />
            </div>
            <h3 className="donation-requests-page__emptyTitle">لا توجد بيانات في هذا القسم</h3>
            <p className="donation-requests-page__emptyText">
              {activeTab === 'my' ? 'لم تُنشئ أي طلبات تبرع بعد.' : 'لا توجد طلبات تمت الموافقة عليها حاليًا.'}
            </p>
          </motion.div>
        ) : (
          <>
            <div className="donation-requests-page__panel">
              <div className="donation-requests-page__sectionHead">
                <p className="donation-requests-page__sectionTitle">{activeTab === 'my' ? 'طلباتك الحالية' : 'الطلبات المقبولة'}</p>
                <span className="donation-requests-page__sectionMeta">صفحة {pageNumber} من {totalPages || 1}</span>
              </div>

              <div className="donation-requests-page__list">
                <AnimatePresence mode="wait">
                  {currentRequests.map((request, index) => {
                    const urgency = getUrgencyLabel(request.urgencyLevel);

                    return (
                      <motion.div
                        key={request.id || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.04 }}
                        className="donation-requests-page__card"
                      >
                        <div className="donation-requests-page__content">
                          <div className="donation-requests-page__titleRow">
                            <h3 className="donation-requests-page__requestTitle">{request.title || 'بدون عنوان'}</h3>
                            <span className={`donation-requests-page__chip is-urgency ${urgency.bg} ${urgency.color}`}>{urgency.label}</span>
                            {activeTab === 'approved' && <span className="donation-requests-page__chip is-approved">تمت الموافقة</span>}
                          </div>

                          <div className="donation-requests-page__meta">
                            <span className="donation-requests-page__metaItem">
                              <FaMoneyBillWave className="text-green-400" />
                              {request.donateAmount?.toLocaleString('ar-EG') || 0} ج.م
                            </span>
                            <span className="donation-requests-page__metaItem">
                              <FaMapMarkerAlt className="text-blue-400" />
                              {request.location || locationNameById[request.locationId] || request.title || 'موقع الطلب'}
                            </span>
                            <span className="donation-requests-page__metaItem">
                              <FaBuilding className="text-purple-400" />
                              {request.partnerName || request.partner?.name || request.partner?.orgName || request.title || 'الشريك المرتبط بالطلب'}
                            </span>
                          </div>

                          {request.briefDescription && <p className="donation-requests-page__description">{request.briefDescription}</p>}
                        </div>

                        <div className="donation-requests-page__actions">
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewDetails(request)} className="donation-requests-page__actionBtn is-info" title="عرض التفاصيل">
                            <FaEye />
                          </motion.button>
                          {activeTab === 'approved' && !isAdmin && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDonate(request)} className="donation-requests-page__actionBtn is-success" title="أريد التبرع">
                              <FaDonate />
                            </motion.button>
                          )}
                          {isAdmin && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEdit(request)} className="donation-requests-page__actionBtn is-edit" title="تعديل">
                              <FaEdit />
                            </motion.button>
                          )}
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDelete(request.id)} disabled={actionLoading[request.id]} className="donation-requests-page__actionBtn is-delete" title="حذف">
                            {actionLoading[request.id] === 'delete' ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {totalPages > 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="donation-requests-page__pagination">
                <button onClick={() => setPageNumber((prev) => Math.max(1, prev - 1))} disabled={pageNumber === 1} className="donation-requests-page__pageBtn">
                  السابق
                </button>
                <span className="donation-requests-page__sectionMeta">صفحة {pageNumber} من {totalPages}</span>
                <button onClick={() => setPageNumber((prev) => Math.min(totalPages, prev + 1))} disabled={pageNumber === totalPages} className="donation-requests-page__pageBtn">
                  التالي
                </button>
              </motion.div>
            )}
          </>
        )}

        <ViewDonationRequestModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedRequest(null);
          }}
          requestId={selectedRequest?.id}
          showDonateButton={activeTab === 'approved' && !isAdmin}
          onDonate={handleDonateFromDetails}
        />

        <EditDonationRequestModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onSuccess={fetchRequests}
        />

        {isAdmin && (
          <CreateDonationRequestModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={handleCreateSuccess}
            locations={locations}
          />
        )}

        {/* Donation Modal */}
        {isDonateModalOpen && selectedRequestForDonation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="app-modal-overlay"
            onClick={() => setIsDonateModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="app-modal-card"
              style={{ maxWidth: '720px' }}
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div className="app-modal-header">
                <div>
                  <h3 className="app-modal-title">تبرع لطلب</h3>
                  <p className="app-modal-subtitle">{selectedRequestForDonation.title || 'بدون عنوان'}</p>
                </div>
                <button
                  onClick={() => setIsDonateModalOpen(false)}
                  className="app-modal-close"
                  aria-label="Close donation modal"
                >
                  ×
                </button>
              </div>

              <div className="overflow-y-auto">
                <div style={{ padding: 18 }}>
                  <CreateDonationForm
                    requestInfo={selectedRequestForDonation}
                    onSuccess={() => {
                      setIsDonateModalOpen(false);
                      setSelectedRequestForDonation(null);
                    }}
                    onError={(errorMessage) => {
                      setError(errorMessage);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Create Donation Form Component
const CreateDonationForm = ({ requestInfo, onSuccess, onError }) => {
  // const [formData, setFormData] = useState({
  //   amount: requestInfo?.donateAmount || '',
  //   paymentMethod: '',
  //   category: '',
  //   targetLocation: requestInfo?.location || '',
  //   receipt: '',
  //   impactReport: ''
  // });
  const [formData, setFormData] = useState({
  amount: requestInfo?.donateAmount || '',
  paymentMethod: '',
  category: '',
  targetLocation: requestInfo?.location || requestInfo?.locationId || '',
  receipt: '',
  impactReport: '',
  donationRequestId: requestInfo?.id || requestInfo?.donationRequestId || ''
});
  const [loading, setLoading] = useState(false);

  // Payment methods options
  const paymentMethods = [
    'credit_card',
    'debit_card', 
    'bank_transfer',
    'cash',
    'paypal',
    'stripe',
    'apple_pay',
    'google_pay'
  ];

  // Categories options
  const categories = [
    'education',
    'healthcare',
    'food',
    'shelter',
    'clothing',
    'emergency',
    'infrastructure',
    'community',
    'environment',
    'other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const donationRequestId =
  requestInfo?.id ||
  requestInfo?.donationRequestId ||
  formData.donationRequestId;

if (!donationRequestId) {
  onError('بيانات طلب التبرع غير مكتملة');
  return;
}

    // Validation
    if (!formData.amount || Number(formData.amount) <= 0) {
      onError('المبلغ مطلوب ويجب أن يكون أكبر من صفر');
      return;
    }

    if (!formData.paymentMethod) {
      onError('طريقة الدفع مطلوبة');
      return;
    }

    if (!formData.category) {
      onError('الفئة مطلوبة');
      return;
    }

    setLoading(true);

    try {
      // const result = await donationOrdersService.createDonationOrder(formData);

const payload = {
  ...formData,
  donationRequestId
};

const result = await donationOrdersService.createDonationOrder(payload);

      console.log('Donation order created successfully:', result);
      
      // Reset form
      // setFormData({
      //   amount: '',
      //   paymentMethod: '',
      //   category: '',
      //   targetLocation: '',
      //   receipt: '',
      //   impactReport: ''
      // });
      setFormData({
  amount: '',
  paymentMethod: '',
  category: '',
  targetLocation: '',
  receipt: '',
  impactReport: '',
  donationRequestId: ''
});
      
      onSuccess();
    } catch (err) {
      console.error('Error creating donation order:', err);
      onError(err.message || 'فشل في إنشاء طلب التبرع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            المبلغ
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="app-form-input"
            placeholder="أدخل المبلغ"
            min="1"
            step="0.01"
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            طريقة الدفع
          </label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleInputChange}
            className="app-form-input"
            required
          >
            <option value="">اختر طريقة الدفع</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            الفئة
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="app-form-input"
            required
          >
            <option value="">اختر الفئة</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            الموقع المستهدف (اختياري)
          </label>
          <input
            type="text"
            name="targetLocation"
            value={formData.targetLocation}
            onChange={handleInputChange}
            className="app-form-input"
            placeholder="أدخل الموقع المستهدف"
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            الإيصال (اختياري)
          </label>
          <textarea
            name="receipt"
            value={formData.receipt}
            onChange={handleInputChange}
            className="app-form-input app-form-textarea"
            placeholder="أدخل تفاصيل الإيصال"
            rows={3}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: 'var(--text)', fontWeight: '600', marginBottom: '8px' }}>
            تقرير الأثر (اختياري)
          </label>
          <textarea
            name="impactReport"
            value={formData.impactReport}
            onChange={handleInputChange}
            className="app-form-input app-form-textarea"
            placeholder="أدخل تفاصيل تقرير الأثر"
            rows={3}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          className="app-btn-primary"
          style={{ flex: 1 }}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>جاري الإنشاء...</span>
            </>
          ) : (
            <>
              <FaDonate />
              <span>إنشاء طلب التبرع</span>
            </>
          )}
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSuccess()}
          className="app-btn-secondary"
          style={{ flex: 1 }}
        >
          إلغاء
        </motion.button>
      </div>
    </form>
  );
};

export default UserDonationRequestsPage;
