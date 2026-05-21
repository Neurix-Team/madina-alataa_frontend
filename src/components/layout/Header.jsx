// src/components/layout/Header.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaGlobe, FaMoon, FaSignOutAlt, FaSun } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import ThemeService from '../../services/ThemeService';

const HEADER_CSS = `
  .layout-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 18px;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    box-shadow: var(--shadow-md);
    color: var(--text-primary);
    position: relative;
    z-index: 1200;
  }

  .layout-header__welcome {
    display: flex;
    align-items: center;
    min-width: 0;
    font-family: 'Cairo', sans-serif;
    font-size: 17px;
    font-weight: 900;
    color: var(--text-primary);
  }

  .layout-header__welcome strong {
    color: var(--primary);
    font-weight: 900;
  }

  .layout-header__actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .layout-header__iconBtn {
    width: 48px;
    height: 48px;
    border-radius: 16px;
    border: 1px solid var(--border);
    background: var(--bg-card-2);
    color: var(--text-secondary);
    display: grid;
    place-items: center;
    cursor: pointer;
    font-size: 18px;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
    box-shadow: var(--shadow-sm);
  }

  .layout-header__iconBtn:hover {
    transform: translateY(-1px);
    background: var(--bg-card);
    color: var(--text-primary);
    box-shadow: var(--shadow-md);
  }

  .layout-header__iconBtn--theme.is-dark {
    color: #fbbf24;
    border-color: rgba(251, 191, 36, 0.28);
    background: rgba(251, 191, 36, 0.1);
  }

  .layout-header__iconBtn--logout {
    color: var(--error);
    border-color: rgba(239, 68, 68, 0.22);
    background: rgba(239, 68, 68, 0.08);
  }

  .layout-header__iconBtn--logout:hover {
    color: #fca5a5;
    border-color: rgba(248, 113, 113, 0.42);
    background: rgba(239, 68, 68, 0.14);
  }

  .layout-header__language {
    position: relative;
  }

  .layout-header__langMenu {
    position: absolute;
    top: calc(100% + 10px);
    width: 190px;
    min-width: 180px;
    padding: 8px;
    border-radius: 18px;
    background: var(--bg-card);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
  }

  .layout-header__langItem {
    width: 100%;
    min-height: 42px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 10px 14px;
    cursor: pointer;
    font-family: 'Cairo', sans-serif;
    font-size: 13px;
    font-weight: 800;
    transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
    text-align: right;
    direction: rtl;
  }

  .layout-header__langItem:hover {
    background: rgba(15, 23, 42, 0.06);
    color: var(--text-primary);
  }

  .layout-header__langItem.is-active {
    background: rgba(37, 99, 235, 0.18);
    border-color: rgba(37, 99, 235, 0.18);
    color: #2563eb;
  }

  .layout-header__langItemName {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .layout-header {
      padding: 10px 12px;
      gap: 10px;
      border-radius: 16px;
    }

    .layout-header__welcome {
      font-size: 14px;
      line-height: 1.5;
    }

    .layout-header__actions {
      gap: 8px;
    }

    .layout-header__iconBtn {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      font-size: 16px;
    }

    .layout-header__langMenu {
      width: min(190px, calc(100vw - 32px));
    }
  }
`;

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(() => ThemeService.getInstance().isDark);
  const [showLanguages, setShowLanguages] = useState(false);

  useEffect(() => {
    const unsubscribe = ThemeService.getInstance().subscribe((theme) => setIsDark(theme === 'dark'));
    return unsubscribe;
  }, []);

  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const isRtl = i18n.language === 'ar';
  const userName = user?.name || user?.fullName || user?.userName;

  const toggleTheme = () => ThemeService.getInstance().toggle();

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    if (user?.id) {
      localStorage.setItem(`app-language-${user.id}`, langCode);
    }
    localStorage.setItem('app-language', langCode);
    setShowLanguages(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="layout-header" dir={isRtl ? 'rtl' : 'ltr'}>
      <style>{HEADER_CSS}</style>

      <div className="layout-header__welcome">
        {userName ? (
          <span>
            {isRtl ? 'مرحبًا، ' : 'Welcome, '}
            <strong>{userName}</strong>
          </span>
        ) : (
          <span>{t('sidebar.app_title')}</span>
        )}
      </div>

      <div className="layout-header__actions">
        <button
          type="button"
          className={`layout-header__iconBtn layout-header__iconBtn--theme${isDark ? ' is-dark' : ''}`}
          onClick={toggleTheme}
          title={isDark ? t('sidebar.light_mode') : t('sidebar.dark_mode')}
          aria-label={isDark ? t('sidebar.light_mode') : t('sidebar.dark_mode')}
        >
          {isDark ? <FaSun /> : <FaMoon />}
        </button>

        <div className="layout-header__language">
          <button
            type="button"
            className="layout-header__iconBtn"
            onClick={() => setShowLanguages((current) => !current)}
            title={t('sidebar.change_language')}
            aria-label={t('sidebar.change_language')}
          >
            <FaGlobe />
          </button>

          {showLanguages && (
            <div
              className="layout-header__langMenu"
              style={{
                right: isRtl ? 0 : 'auto',
                left: isRtl ? 'auto' : 0,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              {languages.map((lang) => {
                const active = i18n.language === lang.code;

                return (
                  <button
                    key={lang.code}
                    type="button"
                    className={`layout-header__langItem${active ? ' is-active' : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                    dir={isRtl ? 'rtl' : 'ltr'}
                  >
                    <span>{lang.flag}</span>
                    <span className="layout-header__langItemName">{lang.name}</span>
                    {active && <FaCheck size={12} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="button"
          className="layout-header__iconBtn layout-header__iconBtn--logout"
          onClick={handleLogout}
          title={t('sidebar.logout')}
          aria-label={t('sidebar.logout')}
        >
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
}
