import React, { useEffect, useState } from 'react';
import AppLoader from './AppLoader';
import {
  getGlobalLoadingCount,
  subscribeToGlobalLoading,
} from '../../utils/globalLoading';

const SHOW_DELAY_MS = 120;
const MIN_VISIBLE_MS = 260;

export default function GlobalLoadingHost({ contained = false }) {
  const [loadingCount, setLoadingCount] = useState(() => getGlobalLoadingCount());
  const [visible, setVisible] = useState(() => getGlobalLoadingCount() > 0);

  useEffect(() => subscribeToGlobalLoading(setLoadingCount), []);

  useEffect(() => {
    let showTimer;
    let hideTimer;

    if (loadingCount > 0) {
      if (!visible) {
        showTimer = window.setTimeout(() => {
          setVisible(true);
        }, SHOW_DELAY_MS);
      }
    } else if (visible) {
      hideTimer = window.setTimeout(() => {
        setVisible(false);
      }, MIN_VISIBLE_MS);
    }

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, [loadingCount, visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: contained ? 'absolute' : 'fixed',
        inset: 0,
        zIndex: 1600,
        background: contained ? 'rgba(248,250,252,0.94)' : 'rgba(248,250,252,0.92)',
        borderRadius: contained ? 24 : 0,
        overflow: 'hidden',
      }}
      aria-live="polite"
      aria-busy="true"
    >
      <AppLoader
        message="جاري تحميل الصفحة..."
        fullPage={!contained}
        fillContainer={contained}
      />
    </div>
  );
}
