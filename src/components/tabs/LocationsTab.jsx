import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { locationsService } from '../../services/locationsService';
import AddLocationModal from '../modals/AddLocationModal';
import EditLocationModal from '../modals/EditLocationModal';
import LocationDetailModal from '../modals/LocationDetailModal';
import { 
  FaPlus, FaSearch, FaEye, FaEdit, FaTrash, FaMapMarkerAlt, 
  FaGlobe, FaCompass, FaMapPin, FaStar, FaLock, FaUnlock,
  FaExclamationTriangle, FaFilter, FaList
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
  const [userLevel, setUserLevel] = useState('');
  const [showAvailable, setShowAvailable] = useState(false);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await locationsService.getLocations();
      setLocations(response.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'فشل في جلب العناوين';
      setError(errorMessage);
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableLocations = async (level = '') => {
    try {
      setAvailableLoading(true);
      const response = await locationsService.getAvailableLocations(level);
      setAvailableLocations(response.data || []);
      console.log('Available locations for admin:', response.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'فشل في جلب العناوين المتاحة';
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
      const location = await locationsService.getLocationById(locationId);
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
      // Error is already handled in modal
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

  const handleAddLocation = async (locationData) => {
    try {
      await locationsService.createLocation(locationData);
      setShowAddModal(false);
      fetchLocations();
      alert('تم إضافة العنوان بنجاح');
    } catch (err) {
      console.error('Error adding location:', err);
      // Error is already handled in modal
    }
  };

  const handleShowAvailable = () => {
    setShowAvailable(!showAvailable);
    if (!showAvailable) {
      fetchAvailableLocations(userLevel);
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.requiredLevel?.toString().includes(searchTerm)
  );

  const LocationCard = ({ location, showActions = true }) => (
    <motion.div 
      variants={cardVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className="relative group bg-[#0a192f]/80 backdrop-blur-md rounded-2xl p-6 border border-blue-800/30 transition-all duration-300 shadow-lg hover:shadow-blue-900/50 overflow-hidden"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <FaMapMarkerAlt className="text-blue-400 text-xl" />
              </div>
              <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 leading-tight">
                {location.name}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-200/80 bg-blue-900/20 w-fit px-3 py-1.5 rounded-lg border border-blue-800/30">
              <FaStar className="text-yellow-500" />
              <span className="font-medium">المستوى: {location.requiredLevel}</span>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleViewLocation(location.id)}
                className="p-3 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-900/50 transition-all border border-blue-400/30"
                title="عرض التفاصيل"
              >
                <FaEye className="text-xl" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEditLocation(location)}
                className="p-3 bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl shadow-lg shadow-orange-900/50 transition-all border border-orange-400/30"
                title="تعديل العنوان"
              >
                <FaEdit className="text-xl" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDeleteLocation(location.id)}
                className="p-3 bg-gradient-to-br from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-xl shadow-lg shadow-red-900/50 transition-all border border-red-400/30"
                title="حذف العنوان"
              >
                <FaTrash className="text-xl" />
              </motion.button>
            </div>
          )}
        </div>
        
        {/* Coordinates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#112240]/50 rounded-xl p-4 border border-blue-900/30">
            <div className="flex items-center gap-2 text-sm text-blue-300 mb-2">
              <FaCompass className="text-blue-400" />
              <span className="font-bold">خط الطول</span>
            </div>
            <div className="text-blue-100 font-mono text-lg">
              {location.longitude || 'غير محدد'}
            </div>
          </div>
          <div className="bg-[#112240]/50 rounded-xl p-4 border border-blue-900/30">
            <div className="flex items-center gap-2 text-sm text-blue-300 mb-2">
              <FaGlobe className="text-blue-400" />
              <span className="font-bold">خط العرض</span>
            </div>
            <div className="text-blue-100 font-mono text-lg">
              {location.latitude || 'غير محدد'}
            </div>
          </div>
        </div>

        {/* Location ID */}
        <div className="bg-[#112240]/50 rounded-xl p-3 border border-blue-900/30">
          <div className="flex items-center gap-2 text-sm text-blue-300 mb-1">
            <FaMapPin className="text-blue-400" />
            <span className="font-bold">معرف العنوان</span>
          </div>
          <div className="text-blue-100 font-mono text-sm tracking-wider">
            {location.id}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020817] text-slate-300 p-4 md:p-8 overflow-hidden" dir="rtl">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-[40%] right-[20%] w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10">
        {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <motion.div 
            animate={{ y: [-5, 5, -5], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] border border-white/20"
          >
            <FaMapMarkerAlt className="text-white text-3xl drop-shadow-md" />
          </motion.div>
          <div>
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300 drop-shadow-sm">إدارة العناوين</h2>
            <p className="text-blue-300/80 text-base font-medium mt-2 tracking-wide">إضافة، تعديل، وحذف العناوين الجغرافية</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShowAvailable}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl font-bold text-lg border transition-all ${
              showAvailable 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-900/50 border-green-400/30' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/50 border-blue-400/30'
            }`}
          >
            <FaList />
            {showAvailable ? 'جميع العناوين' : 'العناوين المتاحة'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-4 rounded-2xl shadow-xl shadow-blue-900/50 font-bold text-lg border border-blue-400/30"
          >
            <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform duration-300">
              <FaPlus />
            </div>
            <span>عنوان جديد</span>
          </motion.button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      {!showAvailable && (
        <div className="mb-12 relative z-10">
          <div className="relative max-w-2xl mx-auto md:mx-0 group">
            <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
              <FaSearch className="text-blue-400/50 group-focus-within:text-blue-400 group-focus-within:scale-110 transition-all text-xl" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن عنوان (بالاسم، المستوى المطلوب...)"
              className="w-full bg-[#112240]/80 backdrop-blur-xl border-2 border-blue-800/40 rounded-3xl py-4 pr-14 pl-6 text-xl text-white placeholder-blue-200/30 focus:outline-none focus:border-blue-500 focus:bg-[#1a365d]/90 focus:ring-4 focus:ring-blue-500/20 transition-all shadow-2xl hover:border-blue-700/60"
            />
          </div>
        </div>
      )}

      {/* Available Locations Level Filter */}
      {showAvailable && (
        <div className="mb-12">
          <div className="relative max-w-md mx-auto md:mx-0 group">
            <input
              type="number"
              value={userLevel}
              onChange={(e) => setUserLevel(e.target.value)}
              placeholder="المستوى الخاص بك"
              min="1"
              max="100"
              className="w-full bg-[#112240]/80 backdrop-blur-xl border-2 border-green-800/40 rounded-3xl py-4 pr-6 pl-6 text-xl text-white placeholder-green-200/30 focus:outline-none focus:border-green-500 focus:bg-[#1a365d]/90 focus:ring-4 focus:ring-green-500/20 transition-all shadow-2xl hover:border-green-700/60"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchAvailableLocations(userLevel)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <FaSearch />
            </motion.button>
          </div>
        </div>
      )}

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-8 flex items-center gap-3 text-red-400"
          >
            <FaExclamationTriangle className="text-xl" />
            <span className="font-semibold">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      {loading && !showAvailable ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <div className="text-blue-400 font-bold animate-pulse">جاري تحميل العناوين...</div>
        </div>
      ) : availableLoading && showAvailable ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
          <div className="text-green-400 font-bold animate-pulse">جاري تحميل العناوين المتاحة...</div>
        </div>
      ) : (
        <>
          {/* Results Counter */}
          {!loading && !availableLoading && (
            <div className="flex items-center justify-between mb-6 text-blue-300">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-blue-400" />
                <span className="font-bold">
                  {showAvailable ? `${availableLocations.length} عنوان متاح` : `${filteredLocations.length} عنوان`}
                </span>
              </div>
              {showAvailable && userLevel && (
                <div className="text-sm text-green-200/60">
                  للمستوى: {userLevel}
                </div>
              )}
            </div>
          )}

          {/* Locations Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
          >
            {(showAvailable ? availableLocations : filteredLocations).map((location) => (
              <LocationCard 
                key={location.id} 
                location={location} 
                showActions={!showAvailable}
              />
            ))}
          </motion.div>

          {/* Empty State */}
          {!loading && !availableLoading && (showAvailable ? availableLocations.length === 0 : filteredLocations.length === 0) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-[#112240]/40 rounded-3xl border border-blue-900/30 backdrop-blur-sm"
            >
              <div className="w-24 h-24 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaMapMarkerAlt className="text-4xl text-blue-400/50" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {showAvailable ? 'لا توجد عناوين متاحة' : 'لا توجد عناوين'}
              </h3>
              <p className="text-blue-200/50 mb-8 max-w-md mx-auto">
                {showAvailable ? 'جرب تغيير المستوى لعرض العناوين المتاحة.' : 'جرب البحث عن عناوين أخرى.'}
              </p>
            </motion.div>
          )}
        </>
      )}

      {/* Add Location Modal */}
      <AddLocationModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSubmit={handleAddLocation}
      />

      {/* Edit Location Modal */}
      <EditLocationModal 
        isOpen={showEditModal} 
        onClose={() => {
          setShowEditModal(false);
          setSelectedLocation(null);
        }} 
        onSubmit={handleUpdateLocation}
        location={selectedLocation} 
      />

      {/* Location Detail Modal */}
      <LocationDetailModal 
        isOpen={showDetailModal} 
        onClose={() => setShowDetailModal(false)} 
        location={selectedLocation} 
      />
      </div>
    </div>
  );
};

export default LocationsTab;
