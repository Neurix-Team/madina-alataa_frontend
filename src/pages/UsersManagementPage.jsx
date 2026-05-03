import React, { useState, useEffect } from 'react';
import { axiosClient } from '../services/axiosClient';
import { useAuth } from '../hooks/useAuth';
import { 
  FaUsers, FaUserPlus, FaUserShield, FaTrash, FaKey, FaPlus, 
  FaMinus, FaSearch, FaChevronRight, FaChevronLeft, FaUserCircle,
  FaEnvelope, FaCalendarAlt, FaIdBadge, FaShieldAlt, FaHeart, FaUser
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
  
  // Role-based preferences
  const getRoleBasedInfo = (roles) => {
    if (roles.includes('donor')) {
      return {
        icon: '❤️',
        color: '#ef4444',
        bgColor: 'rgba(239,68,68,.1)',
        borderColor: 'rgba(239,68,68,.3)',
        label: 'متبرع'
      };
    } else if (roles.includes('admin')) {
      return {
        icon: '👑',
        color: '#dc2626',
        bgColor: 'rgba(220,38,38,.1)',
        borderColor: 'rgba(220,38,38,.3)',
        label: 'مدير'
      };
    } else if (roles.includes('volunteer')) {
      return {
        icon: '🤝',
        color: '#16a34a',
        bgColor: 'rgba(22,163,74,.1)',
        borderColor: 'rgba(22,163,74,.3)',
        label: 'متطوع'
      };
    } else if (roles.includes('user')) {
      return {
        icon: '👤',
        color: '#3b82f6',
        bgColor: 'rgba(59,130,246,.1)',
        borderColor: 'rgba(59,130,246,.3)',
        label: 'مستخدم'
      };
    } else {
      return {
        icon: '👤',
        color: '#6b7280',
        bgColor: 'rgba(107,114,128,.1)',
        borderColor: 'rgba(107,114,128,.3)',
        label: 'مستخدم'
      };
    }
  };
  
  const roleInfo = getRoleBasedInfo(rolesArr);

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
          background: roleInfo.bgColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: roleInfo.color,
          border: `1px solid ${roleInfo.borderColor}`,
          fontSize: '20px'
        }}>
          {roleInfo.icon}
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

  const viewUserProfile = async (user) => {
    try {
      const userId = user.id || user.userId;
      const profileId = user.profileId;

      if (!userId && !profileId) {
        console.warn('No user/profile ID found for user:', user);
        return;
      }

      let response;

      if (profileId) {
        console.log(`Fetching profile for user ${user.fullName} with profile ID: ${profileId}`);
        response = await axiosClient.get(`/api/Profiles/${profileId}`);
      } else {
        console.log(`Fetching donor profile for user ${user.fullName} with user ID: ${userId}`);
        response = await axiosClient.get(`/api/donor/user/${userId}`);
      }

      const profileData = response.data?.value || response.data?.profile || response.data;
      console.log('Profile Response:', profileData);
      
      alert(`Profile data for ${user.fullName}:\n${JSON.stringify(profileData, null, 2)}`);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      alert(`Failed to fetch profile: ${error.response?.data?.message || error.message}`);
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

  // Update User State
  const [updateFormData, setUpdateFormData] = useState({
    fullName: '',
    city: '',
    address: '',
    birthDay: '',
    phoneNumber: ''
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [selectedUserForUpdate, setSelectedUserForUpdate] = useState(null);

  // Delete User State
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Assign Roles State
  const [availableRoles, setAvailableRoles] = useState([]);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [assigningRoles, setAssigningRoles] = useState(false);
  const [assignRolesError, setAssignRolesError] = useState(null);
  const [assignRolesSuccess, setAssignRolesSuccess] = useState(false);

  // Create Admin State
  const [adminFormData, setAdminFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    birthDay: ''
  });
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createAdminError, setCreateAdminError] = useState(null);
  const [createAdminSuccess, setCreateAdminSuccess] = useState(false);

  // Remove Roles State
  const [removingRoles, setRemovingRoles] = useState(false);
  const [removeRolesError, setRemoveRolesError] = useState(null);
  const [removeRolesSuccess, setRemoveRolesSuccess] = useState(false);
  const [selectedRolesToRemove, setSelectedRolesToRemove] = useState([]);

  // Donor Profile State
  const [showDonorProfile, setShowDonorProfile] = useState(false);
  const [donorProfileData, setDonorProfileData] = useState(null);
  const [donorProfileLoading, setDonorProfileLoading] = useState(false);
  const [donorProfileError, setDonorProfileError] = useState(null);
  const [selectedDonorUser, setSelectedDonorUser] = useState(null);
  
  // Admin Donor Profile Update State
  const [editingDonorProfile, setEditingDonorProfile] = useState(false);
  const [donorForm, setDonorForm] = useState({
    preferredCategory: '',
    totalDonated: ''
  });
  const [updatingDonorProfile, setUpdatingDonorProfile] = useState(false);
  const [updateDonorError, setUpdateDonorError] = useState(null);
  const [updateDonorSuccess, setUpdateDonorSuccess] = useState(false);

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

  // Update User Functions
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUserForUpdate?.id) return;

    setUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const payload = {
        fullName: updateFormData.fullName,
        city: updateFormData.city,
        address: updateFormData.address,
        birthDay: updateFormData.birthDay,
        phoneNumber: updateFormData.phoneNumber
      };

      console.log('UPDATE USER PAYLOAD:', payload);

      const resp = await axiosClient.put(`/api/user/${selectedUserForUpdate.id}`, payload);
      console.log('UPDATE USER API RESPONSE:', resp.data);

      setUpdateSuccess(true);
      
      // Reset form and go back to list after success
      setUpdateFormData({ fullName: '', city: '', address: '', birthDay: '', phoneNumber: '' });
      setSelectedUserForUpdate(null);
      setTimeout(() => {
        setActive('list');
        setPageNumber(1);
      }, 1500);
    } catch (err) {
      console.error('Failed to update user:', err.response?.data || err.message);
      
      const serverData = err.response?.data;
      let errorMsg = 'فشل في تحديث المستخدم. تأكد من صحة البيانات.';
      
      if (serverData) {
        if (typeof serverData === 'string') errorMsg = serverData;
        else if (serverData.message) errorMsg = serverData.message;
        else if (serverData.error) errorMsg = serverData.error;
        else if (serverData.title) errorMsg = serverData.title;
      }

      setUpdateError(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const openUpdateForm = (user) => {
    setSelectedUserForUpdate(user);
    setUpdateFormData({
      fullName: user.fullName || '',
      city: user.city || '',
      address: user.address || '',
      birthDay: user.birthDay || user.birthDate || '',
      phoneNumber: user.phoneNumber || ''
    });
    // Set current user roles
    setSelectedRoles(user.roles || []);
    setUpdateError(null);
    setUpdateSuccess(false);
    setAssignRolesError(null);
    setAssignRolesSuccess(false);
    setActive('update');
  };

  // Delete User Functions
  const handleDeleteUser = async () => {
    if (!selectedUserForDelete?.id) return;

    setDeleting(true);
    setDeleteError(null);
    setDeleteSuccess(false);

    try {
      console.log('DELETE USER ID:', selectedUserForDelete.id);

      const resp = await axiosClient.delete(`/api/user/${selectedUserForDelete.id}`);
      console.log('DELETE USER API RESPONSE:', resp.data);

      setDeleteSuccess(true);
      setShowDeleteConfirm(false);
      setSelectedUserForDelete(null);
      
      // Refresh list after success
      setTimeout(() => {
        setActive('list');
        setPageNumber(1);
      }, 1500);
    } catch (err) {
      console.error('Failed to delete user:', err.response?.data || err.message);
      
      const serverData = err.response?.data;
      let errorMsg = 'فشل في حذف المستخدم.';
      
      if (serverData) {
        if (typeof serverData === 'string') errorMsg = serverData;
        else if (serverData.message) errorMsg = serverData.message;
        else if (serverData.error) errorMsg = serverData.error;
        else if (serverData.title && !serverData.errors) errorMsg = serverData.title;
        else if (serverData.errors) {
          const firstErrorKey = Object.keys(serverData.errors)[0];
          const firstError = serverData.errors[firstErrorKey];
          errorMsg = Array.isArray(firstError) ? firstError[0] : String(firstError);
        }
      }

      setDeleteError(errorMsg);
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteConfirm = (user) => {
    setSelectedUserForDelete(user);
    setDeleteError(null);
    setDeleteSuccess(false);
    setShowDeleteConfirm(true);
  };

  // Donor Profile Functions
  const fetchDonorProfileByUser = async (userId) => {
    setDonorProfileLoading(true);
    setDonorProfileError(null);

    try {
      console.log('FETCH DONOR PROFILE BY USER API CALL:', userId);
      const resp = await axiosClient.get(`/api/donor/user/${userId}`);
      console.log('FETCH DONOR PROFILE BY USER API RESPONSE:', resp.data);
      setDonorProfileData(resp.data);
      
      // Populate form with current data
      setDonorForm({
        preferredCategory: resp.data.preferredCategory || '',
        totalDonated: resp.data.totalDonated || ''
      });
    } catch (err) {
      console.error('Failed to fetch donor profile:', err.response?.data || err.message);
      
      const serverData = err.response?.data;
      let errorMsg = 'فشل في جلب بيانات المتبرع.';
      
      // Handle specific case when donor profile doesn't exist
      if (err.response?.status === 400 && serverData?.detail === 'Donor profile not found.') {
        errorMsg = 'لا يوجد ملف متبرع لهذا المستخدم. يجب على المستخدم إنشاء ملف متبرع أولاً.';
        // Set empty profile data to show appropriate UI
        setDonorProfileData(null);
        setDonorForm({
          preferredCategory: '',
          totalDonated: ''
        });
      } else if (serverData) {
        if (typeof serverData === 'string') errorMsg = serverData;
        else if (serverData.message) errorMsg = serverData.message;
        else if (serverData.error) errorMsg = serverData.error;
        else if (serverData.detail) errorMsg = serverData.detail;
      }

      setDonorProfileError(errorMsg);
    } finally {
      setDonorProfileLoading(false);
    }
  };

  // Admin update donor profile function - DISABLED as API endpoint doesn't exist
  // Admins can only view donor profiles, donors update their own profiles
  const updateDonorProfileByAdmin = async (e) => {
    e.preventDefault();
    setUpdateDonorError('المسؤولون لا يمكنهم تحديث ملفات المتبرعين. يمكن فقط للمتبرعين تحديث ملفاتهم الشخصية.');
    
    // Hide error message after 5 seconds
    setTimeout(() => {
      setUpdateDonorError(null);
    }, 5000);
  };

  const openDonorProfile = (user) => {
    setSelectedDonorUser(user);
    setDonorProfileError(null);
    setShowDonorProfile(true);
    fetchDonorProfileByUser(user.id);
  };

  const closeDonorProfile = () => {
    setShowDonorProfile(false);
    setDonorProfileData(null);
    setSelectedDonorUser(null);
  };

  // Assign Roles Functions
  const handleAssignRoles = async () => {
    if (!selectedUserForUpdate?.id || selectedRoles.length === 0) return;

    setAssigningRoles(true);
    setAssignRolesError(null);
    setAssignRolesSuccess(false);

    try {
      const payloads = [
        { roles: selectedRoles },
        { roleNames: selectedRoles },
        selectedRoles,
      ];
      let resp = null;
      let lastError = null;

      for (const payload of payloads) {
        try {
          console.log('ASSIGN ROLES PAYLOAD:', payload);
          resp = await axiosClient.post(`/api/user/${selectedUserForUpdate.id}/roles/assign`, payload);
          break;
        } catch (requestError) {
          lastError = requestError;
          console.warn('Assign roles payload failed:', payload, requestError.response?.data || requestError.message);
          if (requestError.response?.status !== 400) {
            throw requestError;
          }
        }
      }

      if (!resp && lastError) {
        throw lastError;
      }

      console.log('ASSIGN ROLES API RESPONSE:', resp.data);

      setAssignRolesSuccess(true);
      
      // Refresh user details to show updated roles
      setTimeout(() => {
        fetchUserDetails(selectedUserForUpdate.id);
        setAssignRolesSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to assign roles:', err.response?.data || err.message);
      
      const serverData = err.response?.data;
      let errorMsg = 'فشل في تعيين الأدوار.';
      
      if (serverData) {
        if (typeof serverData === 'string') errorMsg = serverData;
        else if (serverData.message) errorMsg = serverData.message;
        else if (serverData.error) errorMsg = serverData.error;
        else if (serverData.title && !serverData.errors) errorMsg = serverData.title;
        else if (serverData.errors) {
          const firstErrorKey = Object.keys(serverData.errors)[0];
          const firstError = serverData.errors[firstErrorKey];
          errorMsg = Array.isArray(firstError) ? firstError[0] : String(firstError);
        }
      }

      setAssignRolesError(errorMsg);
    } finally {
      setAssigningRoles(false);
    }
  };

  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const handleRoleToRemoveToggle = (role) => {
    setSelectedRolesToRemove(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  // Remove Roles Functions
  const handleRemoveRoles = async () => {
    if (!selectedUserForUpdate?.id || selectedRolesToRemove.length === 0) return;

    setRemovingRoles(true);
    setRemoveRolesError(null);
    setRemoveRolesSuccess(false);

    try {
      const payloads = [
        { roles: selectedRolesToRemove },
        { roleNames: selectedRolesToRemove },
        selectedRolesToRemove,
      ];
      let resp = null;
      let lastError = null;

      for (const payload of payloads) {
        try {
          console.log('REMOVE ROLES PAYLOAD:', payload);
          resp = await axiosClient.post(`/api/user/${selectedUserForUpdate.id}/roles/remove`, payload);
          break;
        } catch (requestError) {
          lastError = requestError;
          console.warn('Remove roles payload failed:', payload, requestError.response?.data || requestError.message);
          if (requestError.response?.status !== 400) {
            throw requestError;
          }
        }
      }

      if (!resp && lastError) {
        throw lastError;
      }

      console.log('REMOVE ROLES API RESPONSE:', resp.data);

      setRemoveRolesSuccess(true);
      setSelectedRolesToRemove([]);
      
      // Refresh user details to show updated roles
      setTimeout(() => {
        fetchUserDetails(selectedUserForUpdate.id);
        setRemoveRolesSuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to remove roles:', err.response?.data || err.message);
      
      const serverData = err.response?.data;
      let errorMsg = 'فشل في إزالة الأدوار.';
      
      if (serverData) {
        if (typeof serverData === 'string') errorMsg = serverData;
        else if (serverData.message) errorMsg = serverData.message;
        else if (serverData.error) errorMsg = serverData.error;
      }

      setRemoveRolesError(errorMsg);
    } finally {
      setRemovingRoles(false);
    }
  };

  // Create Admin Functions
  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    setCreatingAdmin(true);
    setCreateAdminError(null);
    setCreateAdminSuccess(false);

    try {
      const payload = {
        email: adminFormData.email,
        password: adminFormData.password,
        fullName: adminFormData.fullName,
        birthDay: adminFormData.birthDay
      };

      console.log('CREATE ADMIN PAYLOAD:', payload);

      const resp = await axiosClient.post('/api/user/admin', payload);
      console.log('CREATE ADMIN API RESPONSE:', resp.data);

      setCreateAdminSuccess(true);
      setAdminFormData({
        email: '',
        password: '',
        fullName: '',
        birthDay: ''
      });

      // Refresh list after success
      setTimeout(() => {
        setActive('list');
        setPageNumber(1);
      }, 1500);
    } catch (err) {
      console.error('Failed to create admin:', err.response?.data || err.message);
      
      const serverData = err.response?.data;
      let errorMsg = 'فشل في إنشاء حساب الأدمن.';
      
      if (serverData) {
        if (typeof serverData === 'string') errorMsg = serverData;
        else if (serverData.message) errorMsg = serverData.message;
        else if (serverData.error) errorMsg = serverData.error;
        else if (serverData.title) errorMsg = serverData.title;
      }

      setCreateAdminError(errorMsg);
    } finally {
      setCreatingAdmin(false);
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
                            {/* Donor Profile Icon - Available for all users */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openDonorProfile(u)}
                              title="عرض ملف المتبرع"
                              style={{
                                padding: '8px',
                                borderRadius: 10,
                                border: 'none',
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <FaHeart size={14} />
                            </motion.button>
                            
                            {/* User Details Icon - Available for all users */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => fetchUserDetails(u.id)}
                              title="عرض تفاصيل المستخدم"
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
                            
                            {/* Profile View Icon - Available for all users */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => viewUserProfile(u)}
                              title="عرض البروفايل"
                              style={{
                                padding: '8px',
                                borderRadius: 10,
                                border: 'none',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: '#fff',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <FaUser size={14} />
                            </motion.button>
                            
                            {/* Admin-only actions */}
                            {user?.roles?.map(r => r.toLowerCase()).includes('admin') && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openUpdateForm(u)}
                                  title="تحديث المستخدم"
                                  style={{
                                    padding: '8px',
                                    borderRadius: 10,
                                    border: 'none',
                                    background: '#fef3c7',
                                    color: '#f59e0b',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <FaKey size={14} />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openDeleteConfirm(u)}
                                  title="حذف المستخدم"
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
                              </>
                            )}
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

          {active === 'update' && (
            user?.roles?.map(r => r.toLowerCase()).includes('admin') ? (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleUpdateUser}
                style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, margin: '0 auto' }}
              >
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>الاسم الكامل</label>
                    <input
                      required
                      placeholder="أدخل الاسم بالكامل"
                      value={updateFormData.fullName}
                      onChange={(e) => setUpdateFormData({...updateFormData, fullName: e.target.value})}
                      style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>المدينة</label>
                    <input
                      placeholder="أدخل المدينة"
                      value={updateFormData.city}
                      onChange={(e) => setUpdateFormData({...updateFormData, city: e.target.value})}
                      style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>العنوان</label>
                    <input
                      placeholder="أدخل العنوان"
                      value={updateFormData.address}
                      onChange={(e) => setUpdateFormData({...updateFormData, address: e.target.value})}
                      style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>تاريخ الميلاد</label>
                    <input
                      type="date"
                      value={updateFormData.birthDay}
                      onChange={(e) => setUpdateFormData({...updateFormData, birthDay: e.target.value})}
                      style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'Cairo, sans-serif' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>رقم الهاتف</label>
                    <input
                      placeholder="أدخل رقم الهاتف"
                      value={updateFormData.phoneNumber}
                      onChange={(e) => setUpdateFormData({...updateFormData, phoneNumber: e.target.value})}
                      style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>تعيين الأدوار</label>
                    <div style={{ 
                      padding: '12px', 
                      borderRadius: 12, 
                      border: '1.5px solid #e2e8f0', 
                      background: '#f8fafc' 
                    }}>
                      <div style={{ display: 'grid', gap: 8 }}>
                        {['admin', 'user', 'volunteer', 'donor'].map(role => (
                          <label
                            key={role}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '8px',
                              borderRadius: 8,
                              background: selectedRoles.includes(role) ? '#e0e7ff' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedRoles.includes(role)}
                              onChange={() => handleRoleToggle(role)}
                              style={{ margin: 0 }}
                            />
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                              {role}
                            </span>
                          </label>
                        ))}
                      </div>
                      
                      {selectedRoles.length > 0 && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={assigningRoles}
                          onClick={handleAssignRoles}
                          style={{
                            marginTop: 12,
                            padding: '10px',
                            borderRadius: 10,
                            background: assigningRoles ? '#94a3b8' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: 800,
                            fontSize: 13,
                            cursor: assigningRoles ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {assigningRoles ? 'جاري التعيين...' : `تعيين ${selectedRoles.length} دور(أدوار)`}
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>إزالة الأدوار</label>
                    <div style={{ 
                      padding: '12px', 
                      borderRadius: 12, 
                      border: '1.5px solid #e2e8f0', 
                      background: '#fef2f2' 
                    }}>
                      {(selectedUserForUpdate?.roles || []).length > 0 ? (
                        <>
                          <div style={{ display: 'grid', gap: 8 }}>
                            {(selectedUserForUpdate?.roles || []).map(role => (
                              <label
                                key={role}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8,
                                  padding: '8px',
                                  borderRadius: 8,
                                  background: selectedRolesToRemove.includes(role) ? '#fee2e2' : '#ffffff',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRolesToRemove.includes(role)}
                                  onChange={() => handleRoleToRemoveToggle(role)}
                                  style={{ margin: 0 }}
                                />
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                                  {role}
                                </span>
                              </label>
                            ))}
                          </div>
                          
                          {selectedRolesToRemove.length > 0 && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={removingRoles}
                              onClick={handleRemoveRoles}
                              style={{
                                marginTop: 12,
                                padding: '10px',
                                borderRadius: 10,
                                background: removingRoles ? '#94a3b8' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: '#fff',
                                border: 'none',
                                fontWeight: 800,
                                fontSize: 13,
                                cursor: removingRoles ? 'not-allowed' : 'pointer'
                              }}
                            >
                              {removingRoles ? 'جاري الإزالة...' : `إزالة ${selectedRolesToRemove.length} دور(أدوار)`}
                            </motion.button>
                          )}
                        </>
                      ) : (
                        <div style={{ 
                          padding: '16px', 
                          textAlign: 'center', 
                          color: '#64748b', 
                          fontSize: 13,
                          fontStyle: 'italic'
                        }}>
                          لا توجد أدوار حالية لإزالتها
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {updateError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#fee2e2', color: '#b91c1c', fontSize: 13, fontWeight: 800, textAlign: 'center' }}
                  >
                    {updateError}
                  </motion.div>
                )}

                {removeRolesError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#fee2e2', color: '#b91c1c', fontSize: 13, fontWeight: 800, textAlign: 'center' }}
                  >
                    {removeRolesError}
                  </motion.div>
                )}

                {removeRolesSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#dcfce7', color: '#15803d', fontSize: 13, fontWeight: 800, textAlign: 'center' }}
                  >
                    تم إزالة الأدوار بنجاح!
                  </motion.div>
                )}

                {assignRolesError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#fee2e2', color: '#b91c1c', fontSize: 13, fontWeight: 800, textAlign: 'center' }}
                  >
                    {assignRolesError}
                  </motion.div>
                )}

                {assignRolesSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#dcfce7', color: '#15803d', fontSize: 13, fontWeight: 800, textAlign: 'center' }}
                  >
                    تم تعيين الأدوار بنجاح!
                  </motion.div>
                )}

                {updateSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#dcfce7', color: '#15803d', fontSize: 13, fontWeight: 800, textAlign: 'center' }}
                  >
                    تم تحديث المستخدم بنجاح! جاري العودة للقائمة...
                  </motion.div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={updating}
                    type="submit"
                    style={{
                      flex: 1,
                      marginTop: 8,
                      padding: '14px',
                      borderRadius: 14,
                      background: updating ? '#94a3b8' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: 15,
                      cursor: updating ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.2)'
                    }}
                  >
                    {updating ? 'جاري التحديث...' : 'تحديث المستخدم'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setActive('list')}
                    style={{
                      marginTop: 8,
                      padding: '14px',
                      borderRadius: 14,
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: 15,
                      cursor: 'pointer'
                    }}
                  >
                    إلغاء
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', background: '#fff1f2', borderRadius: 16, color: '#be123c' }}>
                <FaUserShield size={32} style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 900 }}>ليس لديك صلاحية الوصول لهذه الصفحة.</div>
              </div>
            )
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: 32,
                  maxWidth: 400,
                  width: '90%',
                  textAlign: 'center',
                  direction: 'rtl'
                }}
              >
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#ef4444'
                }}>
                  <FaTrash size={32} />
                </div>
                
                <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 900, color: '#1e293b' }}>تأكيد الحذف</h3>
                <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
                  هل أنت متأكد من حذف المستخدم "{selectedUserForDelete?.fullName || selectedUserForDelete?.email}"؟
                  <br />
                  هذا الإجراء لا يمكن التراجع عنه.
                </p>

                {deleteError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#fee2e2', color: '#b91c1c', fontSize: 13, fontWeight: 800, textAlign: 'center', marginBottom: 20 }}
                  >
                    {deleteError}
                  </motion.div>
                )}

                {deleteSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#dcfce7', color: '#15803d', fontSize: 13, fontWeight: 800, textAlign: 'center', marginBottom: 20 }}
                  >
                    تم حذف المستخدم بنجاح!
                  </motion.div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={deleting}
                    onClick={handleDeleteUser}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: 14,
                      background: deleting ? '#94a3b8' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: 15,
                      cursor: deleting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    {deleting ? 'جاري الحذف...' : 'نعم، احذف'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={deleting}
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedUserForDelete(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '14px',
                      borderRadius: 14,
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: 15,
                      cursor: deleting ? 'not-allowed' : 'pointer'
                    }}
                  >
                    إلغاء
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {active === 'createAdmin' && (
            user?.roles?.map(r => r.toLowerCase()).includes('admin') ? (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleCreateAdmin}
                style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500, margin: '0 auto' }}
              >
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>الاسم الكامل</label>
                    <input
                      required
                      placeholder="أدخل الاسم بالكامل"
                      value={adminFormData.fullName}
                      onChange={(e) => setAdminFormData({...adminFormData, fullName: e.target.value})}
                      style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>البريد الإلكتروني</label>
                    <input
                      required
                      type="email"
                      placeholder="example@domain.com"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                      style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>كلمة المرور</label>
                    <input
                      required
                      type="password"
                      placeholder="••••••••"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
                      style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 800, color: '#475569' }}>تاريخ الميلاد</label>
                    <input
                      required
                      type="date"
                      value={adminFormData.birthDay}
                      onChange={(e) => setAdminFormData({...adminFormData, birthDay: e.target.value})}
                      style={{ padding: '12px', borderRadius: 12, border: '1.5px solid #e2e8f0', outline: 'none', fontFamily: 'Cairo, sans-serif' }}
                    />
                  </div>
                </div>

                {createAdminError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#fee2e2', color: '#b91c1c', fontSize: 13, fontWeight: 800, textAlign: 'center' }}
                  >
                    {createAdminError}
                  </motion.div>
                )}

                {createAdminSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    style={{ padding: '12px', borderRadius: 12, background: '#dcfce7', color: '#15803d', fontSize: 13, fontWeight: 800, textAlign: 'center' }}
                  >
                    تم إنشاء حساب الأدمن بنجاح! جاري العودة للقائمة...
                  </motion.div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={creatingAdmin}
                    type="submit"
                    style={{
                      flex: 1,
                      marginTop: 8,
                      padding: '14px',
                      borderRadius: 14,
                      background: creatingAdmin ? '#94a3b8' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: 15,
                      cursor: creatingAdmin ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 15px -3px rgba(6, 182, 212, 0.2)'
                    }}
                  >
                    {creatingAdmin ? 'جاري الإنشاء...' : 'إنشاء حساب أدمن'}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setActive('list')}
                    style={{
                      marginTop: 8,
                      padding: '14px',
                      borderRadius: 14,
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      fontWeight: 900,
                      fontSize: 15,
                      cursor: 'pointer'
                    }}
                  >
                    إلغاء
                  </motion.button>
                </div>
              </motion.form>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', background: '#fff1f2', borderRadius: 16, color: '#be123c' }}>
                <FaUserShield size={32} style={{ marginBottom: 12 }} />
                <div style={{ fontWeight: 900 }}>ليس لديك صلاحية الوصول لهذه الصفحة.</div>
              </div>
            )
          )}

          {active !== 'list' && active !== 'create' && active !== 'update' && active !== 'createAdmin' && (
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

      {/* Donor Profile Modal */}
      {showDonorProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,.8)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 100,
          padding: 16,
        }}>
          <div style={{
            width: '100%',
            maxWidth: 600,
            borderRadius: 18,
            border: '1px solid rgba(239,68,68,.3)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))',
            boxShadow: '0 18px 40px rgba(0,0,0,.6)',
            padding: 24,
            textAlign: 'center',
            direction: 'rtl'
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(239,68,68,.2)',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px',
              color: '#ef4444'
            }}>
              <FaHeart size={32} />
            </div>
            
            <h3 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 900, color: '#1e293b' }}>
              ملف المتبرع: {selectedDonorUser?.fullName || selectedDonorUser?.name}
            </h3>
            
            {donorProfileLoading && (
              <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                جاري تحميل بيانات المتبرع...
              </div>
            )}
            
            {donorProfileError && (
              <div style={{
                padding: '16px',
                borderRadius: 12,
                background: 'rgba(239,68,68,.15)',
                color: '#dc2626',
                fontSize: 14,
                fontWeight: 800,
                textAlign: 'center',
                marginBottom: 16
              }}>
                {donorProfileError}
              </div>
            )}
            
            {!donorProfileData && !donorProfileLoading && !donorProfileError && (
              <div style={{
                padding: '24px',
                borderRadius: 12,
                background: 'rgba(251,191,36,.15)',
                border: '1px solid rgba(251,191,36,.35)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#ca8a04', marginBottom: 8 }}>
                  لا يوجد ملف متبرع
                </div>
                <div style={{ fontSize: 13, color: '#92400e', lineHeight: 1.5 }}>
                  هذا المستخدم لم ينشئ ملف متبرع بعد. يجب على المستخدم إنشاء ملف متبرع أولاً من خلال صفحة الملف الشخصي.
                </div>
              </div>
            )}
            
            {donorProfileData && (
              <div style={{ display: 'grid', gap: 16, textAlign: 'right' }}>
                {/* Edit Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                  <button
                    onClick={() => setEditingDonorProfile(!editingDonorProfile)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: editingDonorProfile ? '#f87171' : '#3b82f6',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {editingDonorProfile ? 'إلغاء' : 'تعديل'}
                  </button>
                </div>

                {/* Update Success Message */}
                {updateDonorSuccess && (
                  <div style={{
                    padding: '12px',
                    borderRadius: 12,
                    background: 'rgba(34,197,94,.15)',
                    color: '#16a34a',
                    fontSize: 13,
                    fontWeight: 800,
                    textAlign: 'center',
                    marginBottom: 12
                  }}>
                    تم تحديث بيانات المتبرع بنجاح!
                  </div>
                )}

                {/* Update Error Message */}
                {updateDonorError && (
                  <div style={{
                    padding: '12px',
                    borderRadius: 12,
                    background: 'rgba(239,68,68,.15)',
                    color: '#dc2626',
                    fontSize: 13,
                    fontWeight: 800,
                    textAlign: 'center',
                    marginBottom: 12
                  }}>
                    {updateDonorError}
                  </div>
                )}

                {/* Edit Form */}
                {editingDonorProfile && (
                  <form onSubmit={updateDonorProfileByAdmin} style={{ display: 'grid', gap: 12 }}>
                    <div style={{
                      padding: '16px',
                      borderRadius: 12,
                      background: 'rgba(59,130,246,.15)',
                      border: '1px solid rgba(59,130,246,.35)',
                      display: 'grid',
                      gap: 12
                    }}>
                      <div>
                        <label style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' }}>
                          الفئة المفضلة
                        </label>
                        <input
                          type="text"
                          value={donorForm.preferredCategory}
                          onChange={(e) => setDonorForm({...donorForm, preferredCategory: e.target.value})}
                          placeholder="أدخل الفئة المفضلة"
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            fontSize: 14,
                            background: '#fff'
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: '#64748b', marginBottom: 4, display: 'block' }}>
                          إجمالي التبرعات
                        </label>
                        <input
                          type="text"
                          value={donorForm.totalDonated}
                          onChange={(e) => setDonorForm({...donorForm, totalDonated: e.target.value})}
                          placeholder="أدخل إجمالي التبرعات"
                          style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: 8,
                            border: '1px solid #e2e8f0',
                            fontSize: 14,
                            background: '#fff'
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={updatingDonorProfile}
                        style={{
                          padding: '12px',
                          borderRadius: 8,
                          border: 'none',
                          background: updatingDonorProfile ? '#94a3b8' : '#10b981',
                          color: '#fff',
                          cursor: updatingDonorProfile ? 'not-allowed' : 'pointer',
                          fontSize: 14,
                          fontWeight: 900
                        }}
                      >
                        {updatingDonorProfile ? 'جاري التحديث...' : 'حفظ التغييرات'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Display Data */}
                {!editingDonorProfile && (
                  <>
                    <div style={{
                      padding: '16px',
                      borderRadius: 12,
                      background: 'rgba(34,197,94,.15)',
                      border: '1px solid rgba(34,197,94,.35)',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: 12
                    }}>
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>إجمالي التبرعات</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#16a34a' }}>
                          {donorProfileData.totalDonations || donorProfileData.totalDonated || 0} ج.م
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>عدد التبرعات</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#16a34a' }}>
                          {donorProfileData.donationCount || 0}
                        </div>
                      </div>
                    </div>
                    
                    {/* Preferred Category */}
                    {donorProfileData.preferredCategory && (
                      <div style={{
                        padding: '16px',
                        borderRadius: 12,
                        background: 'rgba(168,85,247,.15)',
                        border: '1px solid rgba(168,85,247,.35)'
                      }}>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>الفئة المفضلة</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#9333ea' }}>
                          {donorProfileData.preferredCategory}
                        </div>
                      </div>
                    )}
                    
                    {donorProfileData.lastDonation && (
                      <div style={{
                        padding: '16px',
                        borderRadius: 12,
                        background: 'rgba(59,130,246,.15)',
                        border: '1px solid rgba(59,130,246,.35)'
                      }}>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>آخر تبرع</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2563eb' }}>
                          {donorProfileData.lastDonation.amount || 0} ج.م - {donorProfileData.lastDonation.date || 'غير متوفر'}
                        </div>
                      </div>
                    )}
                    
                    {donorProfileData.favoriteCause && (
                      <div style={{
                        padding: '16px',
                        borderRadius: 12,
                        background: 'rgba(168,85,247,.15)',
                        border: '1px solid rgba(168,85,247,.35)'
                      }}>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>القضية المفضلة</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#9333ea' }}>
                          {donorProfileData.favoriteCause}
                        </div>
                      </div>
                    )}
                    
                    {donorProfileData.memberSince && (
                      <div style={{
                        padding: '16px',
                        borderRadius: 12,
                        background: 'rgba(251,191,36,.15)',
                        border: '1px solid rgba(251,191,36,.35)'
                      }}>
                        <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>عضو منذ</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#ca8a04' }}>
                          {donorProfileData.memberSince}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button
                onClick={closeDonorProfile}
                style={{
                  flex: 1,
                  border: '1px solid rgba(0,0,0,.2)',
                  borderRadius: 12,
                  padding: '12px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  color: '#1e293b',
                  background: 'rgba(255,255,255,.8)',
                }}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;
