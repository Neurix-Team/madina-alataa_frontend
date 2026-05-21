import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: 'champapi.neurix.uk,localhost',
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      // ✅ HMR (Hot Module Reload) — أي تعديل في أي ملف هيتعكس في البراوزر فورًا
      hmr: {
        overlay: true,
      },
      // ✅ تتبع تغييرات الملفات على Windows باستخدام polling
      // ده بيحل مشكلة إن التعديلات مش بتظهر في البراوزر
      watch: {
        usePolling: true,
        interval: 100,
      },
      // ✅ منع البراوزر من كاش الملفات في وضع التطوير
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL || 'https://champapi.neurix.uk',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
