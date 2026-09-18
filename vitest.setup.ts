// Created by: Andrey Polyakov (andrey@polyakov.im)

import '@testing-library/jest-dom/vitest';
import {cleanup} from '@testing-library/react';
import {afterEach} from 'vitest';

// RTL registers its own afterEach(cleanup) only with `globals: true`; without
// it a portal rendered into document.body outlives the test that created it.
afterEach(cleanup);

// jsdom has no layout engine, so @floating-ui/react-dom's autoUpdate (used by
// useDropdownMenuFloating) needs a ResizeObserver polyfill just to construct.
class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

global.ResizeObserver = ResizeObserverStub;
