// Created by: Andrey Polyakov (andrey@polyakov.im)

import React, {useCallback, useRef} from 'react';

/**
 * Returns one ref callback that never changes identity and forwards to the
 * latest `ref`. downshift's prop getters wrap refs in a fresh handleRefs()
 * on every render, so anything passed through them would be detached (null)
 * and re-attached by React on each commit; React only sees the stable
 * callback here, so consumers' refs fire once per mount and once per unmount.
 */
export const useStableRefCallback = <T>(
    ref: React.Ref<T> | undefined,
): React.RefCallback<T> => {
    const latest = useRef(ref);
    // assigned during render on purpose: refs attach in the commit phase,
    // before any effect could update this
    latest.current = ref;

    return useCallback((node: T | null) => {
        const current = latest.current;
        if (typeof current === 'function') {
            current(node);
        } else if (current) {
            (current as React.MutableRefObject<T | null>).current = node;
        }
    }, []);
};
