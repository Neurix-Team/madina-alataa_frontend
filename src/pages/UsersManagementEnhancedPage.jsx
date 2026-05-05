import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaEye, FaSpinner, FaUserCircle, FaUsers } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import UsersManagementPage from './UsersManagementPage';
import { volunteersService } from '../services/volunteersService';

function getTokenRoles() {
  try {
    const token =
      localStorage.getItem('madina_access_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      '';

    if (!token || !token.includes('.')) return [];

    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const rawRoles =
      payload?.roles ||
      payload?.role ||
      payload?.Role ||
      payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
      [];

    return Array.isArray(rawRoles)
      ? rawRoles.map((role) => String(role).toLowerCase())
      : String(rawRoles)
          .split(',')
          .map((role) => role.trim().toLowerCase())
          .filter(Boolean);
  } catch {
    return [];
  }
}

const primaryButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  border: 'none',
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
  color: '#fff',
  padding: '12px 18px',
  cursor: 'pointer',
  fontFamily: "'Cairo', sans-serif",
  fontWeight: 800,
};

const iconButtonStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  border: '1px solid rgba(22,163,74,0.15)',
  background: '#dcfce7',
  color: '#15803d',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const errorBoxStyle = {
  borderRadius: '14px',
  border: '1px solid rgba(239, 68, 68, 0.25)',
  background: 'rgba(239, 68, 68, 0.08)',
  color: '#dc2626',
  padding: '12px 14px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

function VolunteerDetailsCard({ volunteer, onBack }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: 24,
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
        border: '1px solid #dcfce7',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 20 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
          <FaUserCircle size={28} />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{volunteer?.fullName || volunteer?.userName || 'متطوع'}</h3>
          <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{volunteer?.email || 'بدون بريد'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc' }}>
          <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>الاسم</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{volunteer?.fullName || 'غير متوفر'}</span>
        </div>
        <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc' }}>
          <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>البريد</span>
          <span style={{ fontSize: 13, fontWeight: 700, wordBreak: 'break-all' }}>{volunteer?.email || 'غير متوفر'}</span>
        </div>
        <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc' }}>
          <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>المعرف</span>
          <span style={{ fontSize: 13, fontWeight: 700, wordBreak: 'break-all' }}>{volunteer?.id || 'غير متوفر'}</span>
        </div>
        <div style={{ padding: 12, borderRadius: 12, background: '#f8fafc' }}>
          <span style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>تاريخ الميلاد</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>{volunteer?.birthDay || 'غير محدد'}</span>
        </div>
      </div>

      <button type="button" onClick={onBack} style={{ ...primaryButtonStyle, marginTop: 20 }}>
        العودة لقائمة المتطوعين
      </button>
    </div>
  );
}

export default function UsersManagementEnhancedPage() {
  const { user } = useAuth();
  const userRoles = Array.isArray(user?.roles)
    ? user.roles.map((role) => String(role).toLowerCase())
    : [];
  const isAdmin = [...userRoles, ...getTokenRoles()].includes('admin');

  const [showVolunteers, setShowVolunteers] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [volunteersLoading, setVolunteersLoading] = useState(false);
  const [volunteersError, setVolunteersError] = useState('');
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  const handleLoadVolunteers = async () => {
    try {
      setShowVolunteers(true);
      setVolunteersLoading(true);
      setVolunteersError('');
      setSelectedVolunteer(null);
      const payload = await volunteersService.getVolunteers(1, 10);
      console.log('VOLUNTEERS ITEMS IN PAGE:', payload.items);
      setVolunteers(payload.items);
    } catch (error) {
      console.error('VOLUNTEERS LIST PAGE ERROR:', error);
      setVolunteersError('فشل في جلب المتطوعين.');
    } finally {
      setVolunteersLoading(false);
    }
  };

  const handleViewVolunteerDetails = async (volunteerId) => {
    try {
      setDetailsLoading(true);
      setDetailsError('');
      const payload = await volunteersService.getVolunteerById(volunteerId);
      console.log('VOLUNTEER DETAILS IN PAGE:', payload);
      setSelectedVolunteer(payload);
    } catch (error) {
      console.error('VOLUNTEER DETAILS PAGE ERROR:', error);
      setDetailsError('فشل في جلب تفاصيل المتطوع.');
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {isAdmin ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)',
            borderRadius: 24,
            padding: 24,
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
            border: '1.5px solid rgba(226, 232, 240, 0.8)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: showVolunteers ? 20 : 0 }}>
            <div>
              <h3 style={{ margin: 0, color: '#0f172a', fontSize: 20, fontWeight: 900 }}>المتطوعون</h3>
              <p style={{ margin: '6px 0 0 0', color: '#64748b' }}>جلب `Volunteer` items وعرض التفاصيل داخل صفحة إدارة المستخدمين.</p>
            </div>
            <button type="button" onClick={handleLoadVolunteers} style={primaryButtonStyle}>
              <FaUsers />
              <span>عرض المتطوعين</span>
            </button>
          </div>

          {showVolunteers ? (
            detailsLoading ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                <FaSpinner className="animate-spin" size={24} />
                <div style={{ marginTop: 12, fontWeight: 800 }}>جاري تحميل التفاصيل...</div>
              </div>
            ) : detailsError ? (
              <div style={errorBoxStyle}>
                <FaExclamationTriangle />
                <span>{detailsError}</span>
              </div>
            ) : selectedVolunteer ? (
              <VolunteerDetailsCard volunteer={selectedVolunteer} onBack={() => setSelectedVolunteer(null)} />
            ) : volunteersLoading ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                <FaSpinner className="animate-spin" size={24} />
                <div style={{ marginTop: 12, fontWeight: 800 }}>جاري تحميل المتطوعين...</div>
              </div>
            ) : volunteersError ? (
              <div style={errorBoxStyle}>
                <FaExclamationTriangle />
                <span>{volunteersError}</span>
              </div>
            ) : volunteers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8' }}>لا يوجد متطوعون لعرضهم.</div>
            ) : (
              <div style={{ display: 'grid', gap: 12 }}>
                {volunteers.map((volunteer, index) => (
                  <div
                    key={volunteer.id || index}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      background: '#ffffff',
                      border: '1px solid #f1f5f9',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15, color: '#0f172a' }}>{volunteer.fullName || 'متطوع بدون اسم'}</div>
                      <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{volunteer.email || 'بدون بريد'}</div>
                      <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>{volunteer.id || 'بدون معرف'}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleViewVolunteerDetails(volunteer.id)}
                      title="عرض تفاصيل المتطوع"
                      style={iconButtonStyle}
                    >
                      <FaEye />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : null}
        </motion.div>
      ) : null}

      <UsersManagementPage />
    </div>
  );
}
