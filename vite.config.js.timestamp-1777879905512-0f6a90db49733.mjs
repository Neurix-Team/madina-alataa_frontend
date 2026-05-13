// vite.config.js
import { defineConfig, loadEnv } from "file:///C:/Users/PC/Desktop/projects/madina-alataa_frontend-rania-medhat/madina-alataa_frontend-rania-medhat/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/PC/Desktop/projects/madina-alataa_frontend-rania-medhat/madina-alataa_frontend-rania-medhat/node_modules/@vitejs/plugin-react/dist/index.js";
import tailwindcss from "file:///C:/Users/PC/Desktop/projects/madina-alataa_frontend-rania-medhat/madina-alataa_frontend-rania-medhat/node_modules/@tailwindcss/vite/dist/index.mjs";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      proxy: {
        "/api": {
          target: env.VITE_API_BASE_URL || "http://champapi.neurix.uk:5001",
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQQ1xcXFxEZXNrdG9wXFxcXHByb2plY3RzXFxcXG1hZGluYS1hbGF0YWFfZnJvbnRlbmQtcmFuaWEtbWVkaGF0XFxcXG1hZGluYS1hbGF0YWFfZnJvbnRlbmQtcmFuaWEtbWVkaGF0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxQQ1xcXFxEZXNrdG9wXFxcXHByb2plY3RzXFxcXG1hZGluYS1hbGF0YWFfZnJvbnRlbmQtcmFuaWEtbWVkaGF0XFxcXG1hZGluYS1hbGF0YWFfZnJvbnRlbmQtcmFuaWEtbWVkaGF0XFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9QQy9EZXNrdG9wL3Byb2plY3RzL21hZGluYS1hbGF0YWFfZnJvbnRlbmQtcmFuaWEtbWVkaGF0L21hZGluYS1hbGF0YWFfZnJvbnRlbmQtcmFuaWEtbWVkaGF0L3ZpdGUuY29uZmlnLmpzXCI7XHVGRUZGaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB0YWlsd2luZGNzcyBmcm9tICdAdGFpbHdpbmRjc3Mvdml0ZSc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XHJcbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgdGFpbHdpbmRjc3MoKV0sXG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiAnMC4wLjAuMCcsXG4gICAgICBwb3J0OiA1MTczLFxuICAgICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICAgIHByb3h5OiB7XG4gICAgICAgICcvYXBpJzoge1xuICAgICAgICAgIHRhcmdldDogZW52LlZJVEVfQVBJX0JBU0VfVVJMIHx8ICdodHRwOi8vbG9jYWxob3N0OjUxMjgnLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfTtcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNmUsU0FBUyxjQUFjLGVBQWU7QUFDbmhCLE9BQU8sV0FBVztBQUNsQixPQUFPLGlCQUFpQjtBQUV4QixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFDM0MsU0FBTztBQUFBLElBQ0wsU0FBUyxDQUFDLE1BQU0sR0FBRyxZQUFZLENBQUM7QUFBQSxJQUNoQyxRQUFRO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixNQUFNO0FBQUEsTUFDTixZQUFZO0FBQUEsTUFDWixPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsVUFDTixRQUFRLElBQUkscUJBQXFCO0FBQUEsVUFDakMsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFFBQ1Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
