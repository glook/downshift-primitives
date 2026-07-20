// Created by: Andrey Polyakov (andrey@polyakov.im)

import {createRequire} from 'node:module';

import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

const require = createRequire(import.meta.url);

// React 17 ships jsx-runtime.js but declares no "exports" map, so the
// extensionless specifier emitted by the automatic JSX runtime does not resolve
// under ESM. React 18+ has the map and must keep the bare specifier - a subpath
// ending in .js is not exported there.
const needsJsxRuntimeAlias = !require('react/package.json').exports;

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: needsJsxRuntimeAlias
            ? {
                  'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
                  'react/jsx-runtime': 'react/jsx-runtime.js',
              }
            : {},
    },
    test: {
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        globals: false,
        // Externalized dependencies are resolved by Node and bypass the alias
        // above, so on React 17 they have to go through Vite as well.
        server: {deps: {inline: needsJsxRuntimeAlias ? true : []}},
    },
});
