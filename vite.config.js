import { defineConfig } from 'vite';

// Relative assets keep the site working when its GitHub repository is renamed.
export default defineConfig({ base: './' });
