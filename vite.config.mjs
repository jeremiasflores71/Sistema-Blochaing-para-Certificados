import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';
export default defineConfig({base:process.env.GITHUB_ACTIONS?'/Sistema-Blochaing-para-Certificados/':'/',plugins:[react()],publicDir:'frontend/public',server:{port:5173,strictPort:true,proxy:{'/api':'http://127.0.0.1:3001'}}});
