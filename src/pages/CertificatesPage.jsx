import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FaRibbon } from 'react-icons/fa';
import { certificatesService } from '../services/certificatesService';
import { useAuth } from '../hooks/useAuth';

const CertificatesPage = () => {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // استخدام getCertificates للأدمن و getMyCertificates لغير الأدمن
        const response = isAdmin 
          ? await certificatesService.getCertificates({ pageNumber: 1, pageSize: 10 })
          : await certificatesService.getMyCertificates({ pageNumber: 1, pageSize: 10 });
          
        console.log('CERTIFICATES PAGE RESPONSE ITEMS:', response.items);
        console.log('CERTIFICATES PAGE RAW RESPONSE:', response.raw);
        setCertificates(response.items);
      } catch (err) {
        console.error('Failed to fetch certificates page data:', err);
        setError(t('certificates.error'));
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, [isAdmin, t]);

  return (
    <div style={{ padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="pro-container">
        <div className="pro-header" style={{ marginBottom: 24 }}>
          <div className="pro-header-left">
            <div className="pro-header-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
              <FaRibbon />
            </div>
            <div>
              <h2 className="pro-header-title">{t('certificates.title')}</h2>
              <p className="pro-header-subtitle">{t('certificates.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="pro-card">
          {loading ? (
            <div style={{ color: 'var(--text-muted)' }}>{t('certificates.loading')}</div>
          ) : error ? (
            <div style={{ color: 'var(--danger)' }}>{error}</div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {certificates.length === 0 ? (
                <div style={{ color: 'var(--text-muted)' }}>{t('certificates.no_data')}</div>
              ) : (
                certificates.map((certificate, index) => (
                  <div
                    key={certificate.id || `certificate-${index}`}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      border: '1px solid var(--border)',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <div style={{ color: 'var(--text)', fontWeight: 800, marginBottom: 8 }}>
                      {certificate.title || 'Certificate'}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 6 }}>
                      {certificate.description || t('certificates.no_description')}
                    </div>
                    {certificate.issuedAt ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('certificates.issued_at')}: {certificate.issuedAt}</div>
                    ) : null}
                  </div>
                ))
              )}

            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CertificatesPage;
