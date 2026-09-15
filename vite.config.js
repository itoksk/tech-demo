import {defineConfig} from 'vite';
import {resolve} from 'node:path';
export default defineConfig({base:process.env.GITHUB_PAGES==='true'?'/tech-demo/':'/',build:{rollupOptions:{input:{engine:resolve(import.meta.dirname,'index.html'),cvt:resolve(import.meta.dirname,'cvt.html'),bjt:resolve(import.meta.dirname,'bjt.html'),mosfet:resolve(import.meta.dirname,'mosfet.html')},output:{manualChunks:{three:['three'],controls:['three/addons/controls/OrbitControls.js','three/addons/renderers/CSS2DRenderer.js']}}}}});
