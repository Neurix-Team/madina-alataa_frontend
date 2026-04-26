import React, { useState, useEffect } from 'react';
import { axiosClient } from '../services/axiosClient';
import { useAuth } from '../hooks/useAuth';
import { 
  FaUsers, FaUserPlus, FaUserShield, FaTrash, FaKey, FaPlus, 
  FaMinus, FaSearch, FaChevronRight, FaChevronLeft, FaUserCircle,
  FaEnvelope, FaCalendarAlt, FaIdBadge, FaShieldAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ACTIONS = [
  { id: 'list', label: 'قائمة المستخدمين', Icon: FaUsers, color: '#4338ca' },
  { id: 'create', label: 'إنشاء مستخدم جديد', Icon: FaUserPlus, color: '#10b981' },
  { id: 'details', label: 'تفاصيل المستخدم', Icon: FaUserCircle, color: '#6366f1' },
  { id: 'view', label: 'عرض مستخدم', Icon: FaUserShield, color: '#3b82f6' },
  { id: 'update', label: 'تحديث مستخدم', Icon: FaKey, color: '#f59e0b' },
  { id: 'delete', label: 'حذف مستخدم', Icon: FaTrash, color: '#ef4444' },
  { id: 'findByEmail', label: 'بحث بالبريد', Icon: FaEnvelope, color: '#8b5cf6' },
  { id: 'createAdmin', label: 'إنشاء أدمن', Icon: FaShieldAlt, color: '#06b6d4' },
  { id: 'assignRoles', label: 'تعيين أدوار', Icon: FaPlus, color: '#ec4899' },
  { id: 'removeRoles', label: 'إزالة أدوار', Icon: FaMinus, color: '#64748b' },
];

const PanelShell = ({ title, children, icon: Icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)',
      borderRadius: 24,
      padding: '24px',
      boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
      border: '1.5px solid rgba(226, 232, 240, 0.8)',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 12, 
      marginBottom: 20,
      borderBottom: '1px solid #f1f5f9',
      paddingBottom: 16
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: 'linear-gradient(135deg, #eef2ff, #e0e7ff)',
        display: 'flex',
        alignItems: 'center',
        justifyChild: 'center',
        justifyContent: 'center',
        color: '#4338ca'
      }}>
        {Icon && <Icon size={20} />}
      </div>
      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0f172a' }}>{title}</h3>
    </div>
    {children}
  </motion.div>
);

const UserCard = ({ user, index }) => {
  const uid = user.id || user.userId || user.userID || user.ID || `user-${index}`;
  const fullName = user.fullName || user.fullname || user.userName || user.name || user.displayName || user.email || '—';
  const email = user.email || user.emailAddress || user.Email || '—';
  const birthDay = user.birthDay || user.birthDate || user.BirthDay || '—';
  const rolesArr = Array.isArray(user.roles) ? user.roles : Array.isArray(user.role) ? user.role : [];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, boxShadow: '0 12px 20px rgba(15, 23, 42, 0.06)' }}
      style={{
        padding: '16px',
        borderRadius: 16,
        background: '#ffffff',
        border: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: 'linear-gradient(135deg, #f8faff, #f1f5f9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          border: '1px solid #e2e8f0'
        }}>
          <FaUserCircle size={28} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: '#0f172a', marginBottom: 2 }}>{fullName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12 }}>
            <FaEnvelope size={10} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 11, marginTop: 4 }}>
            <FaIdBadge size={10} />
            <span>{uid}</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'left', minWidth: 140 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', marginBottom: 8 }}>
          {rolesArr.length > 0 ? rolesArr.map((role, i) => (
            <span key={i} style={{
              fontSize: 10,
              fontWeight: 900,
              padding: '3px 8px',
              borderRadius: 999,
              background: role.toLowerCase() === 'admin' ? '#fee2e2' : '#eef2ff',
              color: role.toLowerCase() === 'admin' ? '#ef4444' : '#4338ca',
              border: `1px solid ${role.toLowerCase() === 'admin' ? '#fecaca' : '#e0e7ff'}`
            }}>
              {role}
            </span>
          )) : <span style={{ fontSize: 10, color: '#94a3b8' }}>بدون أدوار</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 11, justifyContent: 'flex-end' }}>
          <FaCalendarAlt size={10} />
          <span>{birthDay}</span>
        </div>
      </div>
    </motion.div>
  );
};

const UsersManagementPage = () => {
  const [active, setActive] = useState('list');
  const [selectedUser, setSelectedUser] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const fetchUserDetails = async (id) => {
    if (!id) return;
    try {
      setFetchingDetails(true);
      setDetailsError(null);
      setActive('details');
      const resp = await axiosClient.get(`/api/user/${id}`);
      console.log('GET USER BY ID API RESPONSE:', resp.data);
      setSelectedUser(resp.data);
    } catch (err) {
      console.error('Failed to fetch user details:', err);
      setDetailsError('فشل في جلب تفاصيل المستخدم. قد يكون المعرف غير صحيح.');
    } finally {
      setFetchingDetails(false);
    }
  };
  const [users, setUsers] = useState([]);
  const [forbidden, setForbidden] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Create User Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    birthDay: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const { user } = useAuth();

//   const handleCreateUser = async (e) => {
//     e.preventDefault();
//     setCreating(true);
//     setCreateError(null);
//     setCreateSuccess(false);
//     try {
//       // generate a simple username (letters/numbers only) from email or fullName
//       const makeUsername = (email, name) => {
//         let uname = '';
//         if (email) uname = String(email).split('@')[0] || '';
//         if (!uname && name) uname = String(name).replace(/\s+/g, '');
//         uname = uname.replace(/[^A-Za-z0-9]/g, '');
//         return uname || null;
//       };

//       const username = makeUsername(formData.email, formData.fullName);
//       if (!username) {
//         setCreateError('يرجى إدخال بريد إلكتروني أو اسم كامل صالح لإنشاء اسم مستخدم (أحرف وأرقام فقط).');
//         setCreating(false);
//         return;
//       }

//       const payload = {
//         username,
//         email: formData.email,
//         password: formData.password,
//         fullName: formData.fullName,
//         birthDay: formData.birthDay
//       };

//       const resp = await axiosClient.post('/api/user', payload);
//       console.log('CREATE USER API RESPONSE:', resp.data);
//       setCreateSuccess(true);
//       setFormData({ email: '', password: '', fullName: '', birthDay: '' });
//       // Refresh list and go back after success
//       setTimeout(() => {
//         setActive('list');
//         setPageNumber(1);
//       }, 800);
//     } catch (err) {
//       console.error('Failed to create user:', err.response?.data || err.message);
//       const serverData = err.response?.data;
//       const serverMessage = serverData?.error || serverData?.message || (typeof serverData === 'string' ? serverData : null);
//       setCreateError(serverMessage || 'فشل في إنشاء المستخدم. تأكد من صحة البيانات.');
//     } finally {
//       setCreating(false);
//     }
//   };
  const handleCreateUser = async (e) => {
    e.preventDefault();

    setCreating(true);
    setCreateError(null);
    setCreateSuccess(false);

    try {
      // Generate userName from email or fullName as it's often required by Identity systems
      const generateUserName = (email, name) => {
        if (email) return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 100);
        if (name) return name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 100);
        return 'user' + Date.now();
      };

      const payload = {
        // userName: generateUserName(formData.email, formData.fullName),
        email: formData.email,
        password: formData.password,
        // fullName: formData.fullName?.trim(),
        fullName: formData.fullName, // Some endpoints use lowercase
        birthDay: formData.birthDay,
        // birthDate: formData.birthDay // Some endpoints use birthDate
      };

      console.log('CREATE USER PAYLOAD:', payload);

      const resp = await axiosClient.post('/api/user', payload);

      console.log('CREATE USER API RESPONSE:', resp.data);

      setCreateSuccess(true);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        birthDay: ''
      });

      // Refresh list after a short delay
      setTimeout(() => {
        setActive('list');
        setPageNumber(1);
      }, 1500);

    } catch (err) {
      console.error('Failed to create user:', err.response?.data || err.message);

      const serverData = err.response?.data;
      
      // Try to extract a meaningful error message from the 400 response
      let errorMsg = 'فشل في إنشاء المستخدم. تأكد من صحة البيانات.';
      
      if (serverData) {
        if (typeof serverData === 'string') errorMsg = serverData;
        else if (serverData.message) errorMsg = serverData.message;
        else if (serverData.error) errorMsg = serverData.error;
        else if (serverData.title) errorMsg = serverData.title;
        else if (serverData.errors) {
          // Handle ASP.NET validation errors object
          const firstErrorKey = Object.keys(serverData.errors)[0];
          const firstError = serverData.errors[firstErrorKey];
          errorMsg = Array.isArray(firstError) ? firstError[0] : String(firstError);
        }
      }

      setCreateError(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      if (active !== 'list') return;

      const isAdmin = user?.roles?.map(r => r.toLowerCase()).includes('admin');
      if (!isAdmin) {
        setForbidden(true);
        setUsers([]);
        return;
      }

      try {
        setLoading(true);
        const resp = await axiosClient.get(`/api/user?PageNumber=${pageNumber}&PageSize=${pageSize}&search=${encodeURIComponent(search)}`);

        const payload = resp.data || {};
        const total = payload.totalCount ?? payload.total ?? payload.count ?? payload.totalItems ?? 0;
        setTotalCount(Number(total) || 0);

        let list = [];
        if (Array.isArray(payload.items)) list = payload.items;
        else if (Array.isArray(payload.data)) list = payload.data;
        else if (Array.isArray(payload)) list = payload;
        else if (Array.isArray(payload.result)) list = payload.result;
        else list = [];

        setUsers(list);
        setForbidden(false);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        if (err.response?.status === 403 || err.response?.status === 401) {
          setForbidden(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [active, user, pageNumber, pageSize, search]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const [searchId, setSearchId] = useState('');

  const handleSearchById = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      fetchUserDetails(searchId.trim());
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
      {/* Header Section */}
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: '#1e293b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
            <FaUserShield color="#6366f1" />
            إدارة المستخدمين
          </h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>إدارة حسابات النظام، الصلاحيات، ومراقبة النشاط</p>
        </div>
        
        {/* Search by ID Bar */}
        <form onSubmit={handleSearchById} style={{ display: 'flex', gap: 8 }}>
          <input 
            placeholder="بحث بمعرف المستخدم (ID)..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{ 
              padding: '10px 16px', 
              borderRadius: 12, 
              border: '1.5px solid #e2e8f0', 
              width: 280,
              fontSize: 13,
              outline: 'none'
            }}
          />
          <button 
            type="submit"
            style={{ 
              padding: '10px 20px', 
              borderRadius: 12, 
              border: 'none', 
              background: '#6366f1', 
              color: '#fff', 
              fontWeight: 700, 
              cursor: 'pointer' 
            }}
          >
            بحث
          </button>
        </form>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
        gap: 12, 
        marginBottom: 24 
      }}>
        {ACTIONS.filter(a => {
          if (a.id === 'create' || a.id === 'createAdmin' || a.id === 'delete' || a.id === 'update') {
            return user?.roles?.map(r => r.toLowerCase()).includes('admin');
          }
          return true;
        }).map(a => (
          <motion.button
            key={a.id}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActive(a.id)}
            style={{
              padding: '12px 16px',
              borderRadius: 16,
              border: active === a.id ? 'none' : '1.5px solid #f1f5f9',
              background: active === a.id ? `linear-gradient(135deg, ${a.color}, ${a.color}dd)` : '#ffffff',
              color: active === a.id ? '#ffffff' : '#475569',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              fontSize: 13,
              boxShadow: active === a.id ? `0 8px 20px ${a.color}33` : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <a.Icon size={16} />
            <span>{a.label}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <PanelShell 
          key={active}
          title={ACTIONS.find(x => x.id === active).label}
          icon={ACTIONS.find(x => x.id === active).Icon}
        >
          {/* User Details View */}
          {active === 'details' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}
            >
              {fetchingDetails ? (
                <div style={{ textAlign: 'center', padding: 40 }}>جاري جلب التفاصيل...</div>
              ) : detailsError ? (
                <div style={{ textAlign: 'center', color: '#ef4444', padding: 20 }}>{detailsError}</div>
              ) : selectedUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 16 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#6366f1' }}>
                      <FaUserCircle />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{selectedUser.fullName || selectedUser.userName}</h3>
                      <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{selectedUser.email}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc' }}>
                      <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>الاسم الكامل</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{selectedUser.fullName || selectedUser.fullname || 'غير متوفر'}</span>
                    </div>
                   
                    <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc' }}>
                      <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>البريد الإلكتروني</span>
                      <span style={{ fontSize: 13, fontWeight: 700, wordBreak: 'break-all' }}>{selectedUser.email}</span>
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc' }}>
                      <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>المعرف (ID)</span>
                      <span style={{ fontSize: 13, fontWeight: 700, wordBreak: 'break-all' }}>{selectedUser.id}</span>
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc' }}>
                      <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>تاريخ الميلاد</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{selectedUser.birthDay || selectedUser.birthDate || 'غير محدد'}</span>
                    </div>
                    <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc' }}>
                      <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>الأدوار</span>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {selectedUser.roles?.map(role => (
                          <span key={role} style={{ fontSize: 10, background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 20 }}>{role}</span>
                        )) || 'مستخدم'}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActive('list')}
                    style={{ padding: '12px', borderRadius: 12, border: 'none', background: '#f1f5f9', fontWeight: 700, cursor: 'pointer' }}
                  >
                    العودة للقائمة
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 20 }}>الرجاء اختيار مستخدم لعرض تفاصيله</div>
              )}
            </motion.div>
          )}

          {active === 'list' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 12, 
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8faff',
                padding: '16px',
                borderRadius: 16,
                border: '1px solid #edf2f7'
              }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                  <FaSearch style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPageNumber(1); }}
                    style={{ 
                      width: '100%',
                      padding: '10px 40px 10px 12px', 
                      borderRadius: 12, 
                      border: '1.5px solid #e2e8f0',
                      outline: 'none',
                      fontSize: 13,
                      fontFamily: 'Cairo, sans-serif'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#64748b' }}>حجم الصفحة:</label>
                  <select 
                    value={pageSize} 
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPageNumber(1); }}
                    style={{ 
                      padding: '8px 12px', 
                      borderRadius: 10, 
                      border: '1.5px solid #e2e8f0',
                      background: '#fff',
                      fontSize: 13,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ marginBottom: 12 }}
                  >
                    <FaUsers size={32} />
                  </motion.div>
                  <div style={{ fontWeight: 800 }}>جاري تحميل المستخدمين...</div>
                </div>
              ) : forbidden ? (
                <div style={{ textAlign: 'center', padding: '40px', background: '#fff1f2', borderRadius: 16, color: '#be123c' }}>
                  <FaUserShield size={32} style={{ marginBottom: 12 }} />
                  <div style={{ fontWeight: 900 }}>ليس لديك صلاحية عرض قائمة المستخدمين.</div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {users.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>لا يوجد مستخدمين لعرضهم.</div>
                    ) : (
                      users.map((u, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <UserCard user={u} index={idx} />
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => fetchUserDetails(u.id || u.userId || u.ID)}
                              title="عرض التفاصيل"
                              style={{
                                padding: '8px',
                                borderRadius: 10,
                                border: 'none',
                                background: '#e0e7ff',
                                color: '#4338ca',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <FaUserCircle size={14} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              style={{
                                padding: '8px',
                                borderRadius: 10,
                                border: 'none',
                                background: '#fee2e2',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <FaTrash size={14} />
                            </motion.button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginTop: 20,
                    padding: '16px',
                    borderTop: '1px solid #f1f5f9'
                  }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        disabled={pageNumber <= 1} 
                        onClick={() => setPageNumber(p => Math.max(1, p-1))} 
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          background: pageNumber <= 1 ? '#f8faff' : '#fff',
                          color: pageNumber <= 1 ? '#cbd5e1' : '#4338ca',
                          cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 13,
                          fontWeight: 800
                        }}
                      >
                        <FaChevronRight />
                        <span>السابق</span>
                      </motion.button>
                      
                      <motion.button 
                        whileTap={{ scale: 0.95 }}
                        disabled={pageNumber >= totalPages} 
                        onClick={() => setPageNumber(p => p+1)}
                        style={{ 
                          padding: '8px 16px', 
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          background: pageNumber >= totalPages ? '#f8faff' : '#fff',
                          color: pageNumber >= totalPages ? '#cbd5e1' : '#4338ca',
                          cursor: pageNumber >= totalPages ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 13,
                          fontWeight: 800
                        }}
                      >
                        <span>التالي</span>
                        <FaChevronLeft />
                      </motion.button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        الصفحة <span style={{ color: '#0f172a', fontWeight: 900 }}>{pageNumber}</span> من <span style={{ color: '#0f172a', fontWeight: 900 }}>{totalPages}</span>
                      </div>
                      <div style={{ height: 16, width: 1, background: '#e2e8f0' }} />
                      <div style={{ fontSize: 13, color: '#64748b' }}>
                        إجمالي: <span style={{ color: '#0f172a', fontWeight: 900 }}>{totalCount}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {active === 'create' && (
            user?.roles?.map(r => r.toLowerCase()).includes('admin') ? (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleCreateUser}
                style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, margin: '0 auto' }}
              >
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>الاسم الكامل</label>
                      <input
                        required
                        placeholder="أدخل الاسم بالكامل"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>البريد الإلكتروني</label>
                      <input
                        required
                        type="email"
                        placeholder="example@domain.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>كلمة المرور</label>
                      <input
                        required
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>تاريخ الميلاد</label>
                      <input
                        required
                        type="date"
                        value={formData.birthDay}
                        onChange={(e) => setFormData({...formData, birthDay: e.target.value})}
                        style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'Cairo, sans-serif' }}
                      />
                    </div>
                  </div>

                {createError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#fee2e2', color: '#b91c1c', fontSize: 13, fontWeight: 800, textAlign: 'center' }}
                  >
                    {createError}
                  </motion.div>
                )}

                {createSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#dcfce7', color: '#15803d', fontSize: 13, fontWeight: 800, textAlign: 'center' }}
                  >
                    تم إنشاء المستخدم بنجاح! جاري العودة للقائمة...
                  </motion.div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={creating}
                  type="submit"
                  style={{
                    marginTop: 8,
                    padding: '14px',
                    borderRadius: 14,
                    background: creating ? '#94a3b8' : 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 900,
                    fontSize: 15,
                    cursor: creating ? 'not-allowed' : 'pointer',
                    boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
                  }}
                >
                  {creating ? 'جاري الإنشاء...' : 'إنشاء الحساب الآن'}
                </motion.button>
              </motion.form>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', background: '#fff1f2', borderRadius: 16, color: '#be123c' }}>
                <FaUserShield size={32} style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 900 }}>ليس لديك صلاحية الوصول لهذه الصفحة.</div>
              </div>
            )
          )}

          {active !== 'list' && active !== 'create' && (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                borderRadius: 20, 
                background: '#f8faff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 20px',
                color: '#cbd5e1'
              }}>
                {ACTIONS.find(x => x.id === active).Icon({ size: 32 })}
              </div>
              <h4 style={{ margin: '0 0 8px', color: '#0f172a', fontSize: 18 }}>{ACTIONS.find(x => x.id === active).label}</h4>
              <p style={{ margin: 0, fontSize: 14 }}>هذه الخاصية قيد التطوير حالياً في لوحة الإدارة الجديدة.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActive('list')}
                style={{
                  marginTop: 24,
                  padding: '10px 20px',
                  borderRadius: 12,
                  background: '#f1f5f9',
                  border: 'none',
                  color: '#475569',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: 13
                }}
              >
                العودة للقائمة
              </motion.button>
            </div>
          )}
        </PanelShell>
      </AnimatePresence>
    </div>
  );
};

export default UsersManagementPage;
