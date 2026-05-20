import React, { useState, useEffect } from 'react';
import AppLoader from '../common/AppLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { locationsService } from '../../services/locationsService';
import { useAuth } from '../../hooks/useAuth';
import AddLocationModal from '../modals/AddLocationModal';
import EditLocationModal from '../modals/EditLocationModal';
import LocationDetailModal from '../modals/LocationDetailModal';
import { showAppConfirm } from '../../utils/appAlerts';
import { 
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaMapMarkerAlt, 
  FaGlobe, FaCompass, FaMapPin, FaStar, FaLock, FaUnlock,
  FaExclamationTriangle, FaFilter, FaList, FaChartLine, FaArrowRight, FaArrowLeft,
  FaCheckCircle, FaSatellite
} from 'react-icons/fa';

const LocationsTab = () => {
  const { isAdmin } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [locations, setLocations] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLevel, setUserLevel] = useState('100');
  const [showAvailable, setShowAvailable] = useState(false);

  // Statistics
  const stats = [
    { label: 'إجمالي العناوين', value: locations.length, icon: FaMapMarkerAlt, type: 'primary' },
    { label: 'متوسط المستوى', value: locations.length ? Math.round(locations.reduce((acc, curr) => acc + (curr.requiredLevel || 0), 0) / locations.length) : 0, icon: FaChartLine, type: 'success' },
    { label: 'العناوين النشطة', value: locations.length, icon: FaStar, type: 'warning' },
  ];

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await locationsService.getLocations();
      const fetchedLocations =
        Array.isArray(response) ? response :
        Array.isArray(response?.data) ? response.data :
        Array.isArray(response?.value) ? response.value :
        Array.isArray(response?.values) ? response.values :
        Array.isArray(response?.items) ? response.items :
        Array.isArray(response?.data?.items) ? response.data.items :
        Array.isArray(response?.value?.items) ? response.value.items :
        Array.isArray(response?.values?.items) ? response.values.items :
        [];
      setLocations(fetchedLocations);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'فشل في جلب العناوين';
      setError(errorMessage);
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableLocations = async (level = userLevel) => {
    try {
      setAvailableLoading(true);
      const response = await locationsService.getAvailableLocations(level);
      const fetchedAvailableLocations =
        Array.isArray(response) ? response :
        Array.isArray(response?.data) ? response.data :
        Array.isArray(response?.value) ? response.value :
        Array.isArray(response?.values) ? response.values :
        Array.isArray(response?.items) ? response.items :
        Array.isArray(response?.data?.items) ? response.data.items :
        Array.isArray(response?.value?.items) ? response.value.items :
        Array.isArray(response?.values?.items) ? response.values.items :
        [];
      setAvailableLocations(fetchedAvailableLocations);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'فشل في جلب العناوين المتاحة';
      console.error('Error fetching available locations:', err);
      alert(errorMessage);
    } finally {
      setAvailableLoading(false);
    }
  }; 

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleViewLocation = async (locationId) => {
    try {
      const response = await locationsService.getLocationById(locationId);
      const location = response?.value ?? response?.data ?? response?.result ?? response;
      setSelectedLocation(location);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching location details:', err);
      alert('فشل في جلب تفاصيل العنوان');
    }
  };

  const handleEditLocation = async (location) => {
    try {
      const response = await locationsService.getLocationById(location.id);
      const locationDetails = response?.value ?? response?.data ?? response?.result ?? response;
      console.log('EDIT LOCATION DETAILS RESPONSE:', locationDetails);
      setSelectedLocation(locationDetails || location);
      setShowEditModal(true);
    } catch (err) {
      console.error('Error fetching location details for edit:', err);
      setSelectedLocation(location);
      setShowEditModal(true);
    }
  };

  const handleUpdateLocation = async (locationId, locationData) => {
    try {
      await locationsService.updateLocation(locationId, locationData);
      setShowEditModal(false);
      setSelectedLocation(null);
      fetchLocations();
      alert('تم تحديث العنوان بنجاح');
    } catch (err) {
      console.error('Error updating location:', err);
    }
  };

  const handleDeleteLocation = async (locationId) => {
    const confirmed = await showAppConfirm({
      title: 'حذف العنوان',
      message: 'هل أنت متأكد من حذف هذا العنوان؟ هذا الإجراء لا يمكن التراجع عنه.',
      type: 'danger',
      confirmText: 'حذف',
      cancelText: 'إلغاء',
    });
    if (!confirmed) return;
    try {
      await locationsService.deleteLocation(locationId);
      alert('تم حذف العنوان بنجاح');
      fetchLocations();
    } catch (err) {
      console.error('Error deleting location:', err);
      let errorMessage = 'فشل في حذف العنوان';
      if (err.response?.data?.message) errorMessage = `خطأ: ${err.response.data.message}`;
      else if (err.response?.data?.error) errorMessage = `خطأ: ${err.response.data.error}`;
      else if (err.message) errorMessage = `خطأ: ${err.message}`;
      alert(errorMessage);
    }
  };

  const handleAddLocation = async (locationData) => {
    try {
      await locationsService.createLocation(locationData);
      setShowAddModal(false);
      fetchLocations();
      alert('تم إضافة العنوان بنجاح');
    } catch (err) {
      console.error('Error adding location:', err);
    }
  };

  const handleShowAvailable = () => {
    const nextShowAvailable = !showAvailable;
    setShowAvailable(nextShowAvailable);
    if (nextShowAvailable) {
      fetchAvailableLocations(userLevel);
    }
  };

  const filteredLocations = Array.isArray(locations)
    ? locations.filter(location =>
        location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.requiredLevel?.toString().includes(searchTerm)
      )
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    }
  };

  const LocationCard = ({ location, showActions = true, index }) => (
    <motion.div 
      variants={cardVariants}
      whileHover={isMobile ? {} : { y: -8, scale: 1.01 }}
      className="pro-card pro-hover-scale relative overflow-hidden"
      style={{
        padding: isMobile ? '12px' : '24px',
        borderRadius: isMobile ? '16px' : '32px',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* subtle overlay, theme-safe in light and dark modes */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08), transparent 45%, rgba(16, 185, 129, 0.08))',
        }}
      />

      <div className="relative z-10 p-0">
      <div className="pro-card-header" style={{ 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        gap: isMobile ? 8 : 12,
        padding: '0 0 16px 0',
        borderBottom: '1px solid rgba(226, 232, 240, 0.5)',
        marginBottom: '16px'
      }}>
        <div className="pro-flex pro-items-center pro-gap-3">
          <div className="pro-number" style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, fontSize: isMobile ? 12 : 14 }}>{index + 1}</div>
          <div>
            <h3 className="pro-card-title" style={{ color: 'var(--text-primary)', fontSize: isMobile ? 15 : 18, margin: 0 }}>{location.name}</h3>
          </div>
        </div>
        <span className="pro-badge pro-badge-warning" style={{ fontSize: isMobile ? 10 : 12, marginRight: isMobile ? 0 : 'auto' }}>
          <FaStar style={{ fontSize: '10px' }} />
          مستوى {location.requiredLevel}
        </span>
      </div>
      
      <div className="pro-card-body" style={{ padding: 0 }}>
        <div className="pro-data-grid" style={{ 
          gridTemplateColumns: '1fr',
          gap: isMobile ? 10 : 16
        }}>
          <div className="pro-data-item" style={{ 
            padding: isMobile ? '12px' : '16px 20px',
            background: 'var(--bg-card-2)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <p className="pro-data-label" style={{ fontSize: isMobile ? 10 : 12, marginBottom: '8px' }}>
              <FaCompass style={{ color: 'var(--primary-light)' }} />
              خط الطول
            </p>
            <p className="pro-data-value" style={{ 
              color: 'var(--text-primary)',
              fontSize: isMobile ? 14 : 16,
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>{location.longitude || '0.0000'}</p>
          </div>
          <div className="pro-data-item" style={{ 
            padding: isMobile ? '12px' : '16px 20px',
            background: 'var(--bg-card-2)',
            borderRadius: '16px',
            border: '1px solid var(--border)'
          }}>
            <p className="pro-data-label" style={{ fontSize: isMobile ? 10 : 12, marginBottom: '8px' }}>
              <FaGlobe style={{ color: 'var(--accent)' }} />
              خط العرض
            </p>
            <p className="pro-data-value" style={{ 
              color: 'var(--text-primary)',
              fontSize: isMobile ? 14 : 16,
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>{location.latitude || '0.0000'}</p>
          </div>
        </div>
      </div>

      </div>

      {showActions ? (
        <div className="pro-card-actions" style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: isMobile ? '8px' : '12px', 
          marginTop: '20px', 
          padding: '16px 0 0 0',
          borderTop: '1px solid var(--border)',
          position: 'relative', 
          zIndex: 20 
        }}>
          <motion.button 
            whileHover={isMobile ? {} : { scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => handleViewLocation(location.id)} 
            className="pro-btn pro-btn-icon"
            title="عرض"
            style={{ 
              color: 'var(--primary)',
              background: 'var(--bg-card-2)',
              border: '1px solid var(--border)',
              opacity: 1, 
              boxShadow: 'var(--shadow-sm)',
              flex: isMobile ? 1 : 'none',
              height: isMobile ? 36 : 40
            }}
          >
            <FaEye size={isMobile ? 14 : 16} />
          </motion.button>
          <motion.button 
            whileHover={isMobile ? {} : { scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => handleEditLocation(location)} 
            className="pro-btn pro-btn-icon"
            title="تعديل"
            style={{ 
              color: 'var(--warning)',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              opacity: 1, 
              boxShadow: 'var(--shadow-sm)',
              display: isAdmin ? 'inline-flex' : 'none',
              flex: isMobile ? 1 : 'none',
              height: isMobile ? 36 : 40
            }}
          >
            <FaEdit size={isMobile ? 14 : 16} />
          </motion.button>
          <motion.button 
            whileHover={isMobile ? {} : { scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => handleDeleteLocation(location.id)} 
            className="pro-btn pro-btn-icon"
            title="حذف"
            style={{ 
              color: 'var(--error)',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              opacity: 1, 
              boxShadow: 'var(--shadow-sm)',
              display: isAdmin ? 'inline-flex' : 'none',
              flex: isMobile ? 1 : 'none',
              height: isMobile ? 36 : 40
            }}
          >
            <FaTrash size={isMobile ? 14 : 16} />
          </motion.button>
        </div>
      ) : (
        <div className="pro-info-box" style={{ padding: isMobile ? '8px' : '12px' }}>
          <FaCheckCircle size={isMobile ? 14 : 16} />
          <span style={{ fontSize: isMobile ? 12 : 14 }}>موقع متاح لمستواك</span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="pro-page" style={{ background: 'transparent', padding: isMobile ? '12px' : '40px 48px' }}>
      <style>{`
        .pro-data-value {
          word-break: break-all !important;
          overflow-wrap: break-word !important;
          font-size: 15px !important;
          line-height: 1.4 !important;
          direction: ltr !important;
          display: block !important;
        }
        .pro-data-item {
          padding: 12px 10px !important;
          min-width: 0 !important;
        }
        .pro-data-grid {
          gap: 10px !important;
        }

        @media (max-width: 1100px) {
          .pro-data-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .pro-container { padding: 20px !important; width: 100% !important; max-width: 100vw !important; overflow-x: hidden !important; box-sizing: border-box !important; }
          .pro-card-grid { grid-template-columns: 1fr !important; gap: 20px !important; width: 100% !important; }
          .pro-card { overflow: hidden !important; min-height: auto !important; margin: 0 !important; width: 100% !important; box-sizing: border-box !important; border-radius: 20px !important; }
          .pro-card .pro-card-actions { flex-wrap: wrap !important; gap: 10px !important; padding: 12px !important; }
          .pro-card .pro-card-actions .pro-btn { width: auto !important; flex: 1 !important; height: 44px !important; }
          .pro-card .pro-card-body .pro-data-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .pro-header { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 24px !important; margin-bottom: 30px !important; }
          .pro-header-actions { flex-direction: column !important; gap: 12px !important; width: 100% !important; }
          .pro-header-actions .pro-btn { width: 100% !important; justify-content: center !important; height: 48px !important; }
          .pro-data-value { word-break: break-all !important; font-size: 14px !important; line-height: 1.5 !important; margin-top: 4px !important; }
          .pro-stats { grid-template-columns: 1fr !important; gap: 12px !important; }
        }
      `}</style>
      <div className="pro-container">
        {/* Header */}
        <div className="pro-header">
          <div className="pro-header-left">
            <div className="pro-header-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 10px 25px rgba(217, 119, 6, 0.25)' }}>
              <FaMapMarkerAlt />
            </div>
            <div>
              <h2 className="pro-header-title">إدارة المواقع</h2>
              <p className="pro-header-subtitle">تخصيص وتتبع الإحداثيات الجغرافية للنظام</p>
            </div>
          </div>
          
          <div className="pro-header-actions">
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              onClick={handleShowAvailable} 
              className={`pro-btn ${showAvailable ? 'pro-btn-success' : 'pro-btn-secondary'}`}
            >
              {showAvailable ? <FaMapMarkerAlt /> : <FaList />}
              <span>{showAvailable ? 'عرض الكل' : 'العناوين المتاحة'}</span>
            </motion.button>
            
            {isAdmin && (
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              onClick={() => setShowAddModal(true)} 
              className="pro-btn pro-btn-primary"
            >
              <FaPlus />
              <span>إضافة عنوان</span>
            </motion.button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="pro-stats">
          {stats.map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }} 
              className="pro-stat pro-animate-in"
            >
              <div className={`pro-stat-icon ${s.type}`}>
                <s.icon />
              </div>
              <div>
                <p className="pro-stat-label">{s.label}</p>
                <p className="pro-stat-value">{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search & Filters */}
        <div className="pro-section" style={{ marginBottom: 0 }}>
          {!showAvailable ? (
            <div className="pro-input-group" style={{ maxWidth: '500px' }}>
              <FaSearch className="pro-input-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث بالاسم أو المستوى..."
                className="pro-input with-icon"
              />
            </div>
          ) : (
            <div className="pro-flex pro-gap-3" style={{ maxWidth: '500px' }}>
              <div className="pro-input-group" style={{ flex: 1 }}>
                <FaStar className="pro-input-icon" />
                <input
                  type="number"
                  value={userLevel}
                  onChange={(e) => setUserLevel(e.target.value)}
                  placeholder="المستوى الخاص بك"
                  className="pro-input with-icon"
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }} 
                onClick={() => fetchAvailableLocations(userLevel)} 
                className="pro-btn pro-btn-success"
              >
                <FaSatellite />
                <span>تحديث</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading && !showAvailable ? (
            <AppLoader message="جاري تحميل المواقع..." />
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* Results Count */}
              <p className="pro-section-title" style={{ color: 'var(--text-primary)', fontSize: '24px', fontWeight: '900', marginBottom: '20px' }}>
                {showAvailable ? `${availableLocations.length} موقع متاح` : `${filteredLocations.length} موقع مسجل`}
              </p>

              <div className="pro-card-grid">
                {(showAvailable ? availableLocations : filteredLocations).map((loc, index) => (
                  <LocationCard key={loc.id} location={loc} showActions index={index} />
                ))}
              </div>

              {(showAvailable ? availableLocations.length === 0 : filteredLocations.length === 0) && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="pro-empty">
                  <div className="pro-empty-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <h3 className="pro-empty-title">لا توجد نتائج</h3>
                  <p className="pro-empty-text">
                    لم يتم العثور على مواقع تطابق معايير البحث. جرب بحثاً مختلفاً أو أضف موقعاً جديداً.
                  </p>
                  {isAdmin && (
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    onClick={() => setShowAddModal(true)} 
                    className="pro-btn pro-btn-secondary"
                  >
                    إضافة موقع جديد
                  </motion.button>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <AddLocationModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddLocation}
            existingLocations={locations}
          />
        )}
        {showEditModal && <EditLocationModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedLocation(null); }} onSubmit={handleUpdateLocation} location={selectedLocation} />}
        {showDetailModal && <LocationDetailModal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedLocation(null); }} location={selectedLocation} />}
      </AnimatePresence>
    </div>
  );
};

export default LocationsTab;
