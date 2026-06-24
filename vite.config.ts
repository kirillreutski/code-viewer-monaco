import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true, // Automatically appends the types entry to package.json
      include: ['src/components/VSCodeReplica'], // Target the VSCodeReplica directory only
      // Use the app tsconfig (include: ["src"]) so api-extractor's rollup does not
      // trip over vite.config.ts (pulled in by the solution-style root tsconfig).
      tsconfigPath: './tsconfig.app.json',
      rollupTypes: true, // Bundle all declarations into a single dist/index.d.ts entry
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/components/VSCodeReplica/index.tsx'),
      name: 'CodeViewerMonaco',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      // Treat peer dependencies as external
      external: ['react', 'react-dom', '@monaco-editor/react'],
      output: {
        exports: 'named',
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@monaco-editor/react': 'MonacoEditor',
        },
      },
    },
  },
});
