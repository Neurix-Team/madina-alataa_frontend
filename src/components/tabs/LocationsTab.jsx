import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { locationsService } from '../../services/locationsService';
import AddLocationModal from '../modals/AddLocationModal';
import EditLocationModal from '../modals/EditLocationModal';
import LocationDetailModal from '../modals/LocationDetailModal';
import { 
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaMapMarkerAlt, 
  FaGlobe, FaCompass, FaMapPin, FaStar, FaLock, FaUnlock,
  FaExclamationTriangle, FaFilter, FaList, FaChartLine, FaArrowRight, FaArrowLeft,
  FaCheckCircle, FaSatellite
} from 'react-icons/fa';

const LocationsTab = () => {
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
    { label: 'إجمالي العناوين', value: locations.length, icon: FaMapMarkerAlt, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'متوسط المستوى', value: locations.length ? Math.round(locations.reduce((acc, curr) => acc + (curr.requiredLevel || 0), 0) / locations.length) : 0, icon: FaChartLine, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'العناوين النشطة', value: locations.length, icon: FaStar, color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
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
      const safeLevel = Number(level) > 0 ? Number(level) : 100;
      const response = await locationsService.getAvailableLocations(safeLevel);
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

  const handleEditLocation = (location) => {
    setSelectedLocation(location);
    setShowEditModal(true);
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
    const confirmed = window.confirm('هل أنت متأكد من حذف هذا العنوان؟ هذا الإجراء لا يمكن التراجع عنه.');
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
      const safeLevel = Number(userLevel) > 0 ? Number(userLevel) : 100;
      fetchAvailableLocations(safeLevel);
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

  const LocationCard = ({ location, showActions = true }) => (
    <motion.div 
      variants={cardVariants}
      whileHover={{ y: -12, scale: 1.02 }}
      className="relative group bg-[#0f172a]/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/5 transition-all duration-500 shadow-2xl hover:shadow-blue-900/40 overflow-hidden"
    >
      <div className="absolute -top-24 -right-24 w-56 h-56 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-700" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center border border-blue-500/30 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <FaMapMarkerAlt className="text-blue-400 text-3xl" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-blue-300 transition-all leading-tight mb-2">
                  {location.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  <FaMapPin className="text-blue-500/50" />
                  <span className="truncate max-w-[150px]">{location.id.substring(0, 18)}...</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs font-black text-yellow-400 bg-yellow-500/10 px-5 py-2.5 rounded-[1.2rem] border border-yellow-500/20 shadow-lg uppercase tracking-widest">
                <FaStar className="animate-pulse" />
                <span>المستوى المطلوب: {location.requiredLevel}</span>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex flex-col gap-3 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleViewLocation(location.id)} className="p-3.5 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-2xl transition-all border border-blue-500/20 shadow-xl" title="عرض">
                <FaEye className="text-lg" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEditLocation(location)} className="p-3.5 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white rounded-2xl transition-all border border-orange-500/20 shadow-xl" title="تعديل">
                <FaEdit className="text-lg" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteLocation(location.id)} className="p-3.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-2xl transition-all border border-red-500/20 shadow-xl" title="حذف">
                <FaTrash className="text-lg" />
              </motion.button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-5 mb-8">
          <div className="bg-black/40 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/5 group-hover:border-blue-500/30 transition-all duration-500">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">
              <FaCompass className="text-blue-500" />
              <span>خط الطول</span>
            </div>
            <div className="text-white font-mono text-xl truncate font-bold tabular-nums">
              {location.longitude || '0.0000'}
            </div>
          </div>
          <div className="bg-black/40 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/5 group-hover:border-blue-500/30 transition-all duration-500">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">
              <FaGlobe className="text-indigo-500" />
              <span>خط العرض</span>
            </div>
            <div className="text-white font-mono text-xl truncate font-bold tabular-nums">
              {location.latitude || '0.0000'}
            </div>
          </div>
        </div>

        {!showActions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-3 py-4 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 font-black text-xs uppercase tracking-widest shadow-inner">
            <FaCheckCircle className="text-sm" />
            عنوان متاح لمستواك الحالي
          </motion.div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-[#020617] text-slate-300 p-6 md:p-12 overflow-hidden" dir="rtl">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1], x: [0, 80, 0], y: [0, 40, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} className="absolute -top-[15%] -left-[10%] w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1.3, 1, 1.3], opacity: [0.1, 0.15, 0.1], x: [0, -60, 0], y: [0, -80, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-[15%] -right-[10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Modern Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-20">
          <div className="flex items-center gap-8">
            <motion.div whileHover={{ rotate: 12, scale: 1.15 }} className="w-24 h-24 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-800 flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.4)] border border-white/20 relative overflow-hidden group">
              <FaMapMarkerAlt className="text-white text-4xl drop-shadow-2xl z-10 transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-white/20 rounded-[2rem] animate-ping opacity-10" style={{ animationDuration: '4s' }} />
            </motion.div>
            <div>
              <h2 className="text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-sm">إدارة المواقع</h2>
              <div className="flex items-center gap-4 text-indigo-400/80 font-black text-xl tracking-wide">
                <span className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                تخصيص وتتبع الإحداثيات الجغرافية للنظام
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 w-full lg:w-auto">
            <motion.button whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} onClick={handleShowAvailable} className={`flex-1 lg:flex-none flex items-center justify-center gap-4 px-10 py-6 rounded-[2rem] font-black text-xl transition-all duration-500 border-2 ${showAvailable ? 'bg-emerald-600 border-emerald-400 shadow-[0_20px_40px_-10px_rgba(16,185,129,0.5)] text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10 hover:text-white shadow-2xl'}`}>
              {showAvailable ? <FaMapMarkerAlt /> : <FaList />}
              <span>{showAvailable ? 'عرض الكل' : 'العناوين المتاحة'}</span>
            </motion.button>
            
            <motion.button whileHover={{ scale: 1.05, y: -5, boxShadow: '0 25px 50px -12px rgba(79,70,229,0.5)' }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddModal(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-10 py-6 rounded-[2rem] font-black text-xl border border-white/10 transition-all duration-300 shadow-2xl">
              <FaPlus className="text-lg" />
              <span>إضافة عنوان</span>
            </motion.button>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {stats.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15 }} whileHover={{ y: -8 }} className="bg-white/5 backdrop-blur-2xl border border-white/5 rounded-[3rem] p-8 flex items-center gap-8 group transition-all duration-500 shadow-xl">
              <div className={`w-20 h-20 rounded-3xl ${s.bg} ${s.border} border flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                <s.icon className={`text-4xl ${s.color}`} />
              </div>
              <div>
                <div className="text-slate-500 font-black text-xs mb-1.5 uppercase tracking-[0.2em]">{s.label}</div>
                <div className="text-5xl font-black text-white tracking-tighter tabular-nums">{s.value}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search & Dynamic Filters */}
        <div className="mb-20">
          {!showAvailable ? (
            <div className="relative group max-w-4xl mx-auto">
              <div className="absolute inset-y-0 right-0 flex items-center pr-10 pointer-events-none transition-transform group-focus-within:scale-125 duration-500">
                <FaSearch className="text-indigo-500/30 text-3xl group-focus-within:text-indigo-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث بالاسم أو المستوى المطلوب..."
                className="w-full bg-white/5 backdrop-blur-3xl border-2 border-white/5 rounded-[3rem] py-8 pr-20 pl-10 text-2xl text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500/50 focus:ring-[20px] focus:ring-indigo-500/5 transition-all duration-500 shadow-2xl text-center font-bold"
              />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 max-w-3xl mx-auto">
              <div className="relative flex-1 group">
                <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                  <FaStar className="text-emerald-500/30 text-2xl" />
                </div>
                <input
                  type="number"
                  value={userLevel}
                  onChange={(e) => setUserLevel(e.target.value)}
                  placeholder="المستوى الخاص بك"
                  className="w-full bg-white/5 border-2 border-white/5 rounded-[2rem] py-6 pr-16 pl-8 text-2xl text-white placeholder-slate-700 focus:outline-none focus:border-emerald-500/50 transition-all font-bold text-center"
                />
              </div>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => fetchAvailableLocations(userLevel)} className="px-12 py-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-xl transition-all shadow-2xl flex items-center justify-center gap-4">
                <FaSatellite />
                <span>تحديث النطاق</span>
              </motion.button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading && !showAvailable ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-48">
              <div className="relative">
                <div className="w-32 h-32 border-[6px] border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FaGlobe className="text-indigo-500 text-3xl animate-pulse" />
                </div>
              </div>
              <div className="mt-12 text-slate-500 font-black text-3xl tracking-[0.3em] animate-pulse uppercase">تحديد المواقع</div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}>
              <div className="flex items-center justify-between mb-12 px-8">
                <div className="flex items-center gap-5 text-indigo-300/80 font-black text-lg uppercase tracking-widest">
                  <div className="w-16 h-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.5)]" />
                  <span>{showAvailable ? `وجدنا ${availableLocations.length} موقعاً متاحاً` : `إجمالي المواقع المسجلة: ${filteredLocations.length}`}</span>
                </div>
              </div>

              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {(showAvailable ? availableLocations : filteredLocations).map((loc) => (
                  <LocationCard key={loc.id} location={loc} showActions={!showAvailable} />
                ))}
              </motion.div>

              {(showAvailable ? availableLocations.length === 0 : filteredLocations.length === 0) && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-48 bg-white/5 rounded-[5rem] border-4 border-dashed border-white/5 backdrop-blur-sm relative overflow-hidden group">
                  <div className="w-48 h-48 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-12 shadow-2xl">
                    <FaMapMarkerAlt className="text-8xl text-slate-800" />
                  </div>
                  <h3 className="text-5xl font-black text-white mb-8 tracking-tighter">لم يتم العثور على نتائج</h3>
                  <p className="text-slate-500 text-2xl max-w-xl mx-auto font-bold leading-relaxed mb-12">
                    لم نتمكن من العثور على أي مواقع تطابق معايير البحث الحالية. جرب كلمات بحث أخرى أو أضف موقعاً جديداً.
                  </p>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowAddModal(true)} className="bg-white text-[#020617] px-14 py-5 rounded-2xl font-black text-xl transition-all shadow-2xl">
                    إضافة عنوان جديد
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showAddModal && <AddLocationModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSubmit={handleAddLocation} />}
        {showEditModal && <EditLocationModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedLocation(null); }} onSubmit={handleUpdateLocation} location={selectedLocation} />}
        {showDetailModal && <LocationDetailModal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedLocation(null); }} location={selectedLocation} />}
      </AnimatePresence>
    </div>
  );
};

export default LocationsTab;
