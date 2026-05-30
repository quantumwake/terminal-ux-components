import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'lucide-react', '@headlessui/react', '@heroicons/react', '@quantumwake/kgraph'],
    treeshake: true,
    splitting: false,
});
