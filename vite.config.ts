// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // keep your plugin(s)

export default defineConfig({
  base: '/restaurent/',   // <--- add this line (your repo name)
  plugins: [react()],
});
