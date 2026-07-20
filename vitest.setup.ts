// Created by: Andrey Polyakov (andrey@polyakov.im)

import '@testing-library/jest-dom/vitest';

// jsdom has no layout engine, so @floating-ui/react-dom's autoUpdate (used by
// useDropdownMenuFloating) needs a ResizeObserver polyfill just to construct.
class ResizeObserverStub {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

global.ResizeObserver = ResizeObserverStub;
