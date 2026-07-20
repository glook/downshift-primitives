// Created by: Andrey Polyakov (andrey@polyakov.im)

import {
    autoUpdate,
    flip,
    offset,
    shift,
    size,
    useFloating,
    UseFloatingOptions,
} from '@floating-ui/react-dom';
import {useMemo} from 'react';

export interface DropdownMenuFloatingOptions
    extends Pick<UseFloatingOptions, 'placement'> {
    offset?: number;
    applyWidth?: boolean;
}

export const useDropdownMenuFloating = (
    isOpen: boolean,
    options?: DropdownMenuFloatingOptions,
) => {
    const placement = options?.placement ?? 'bottom-start';
    const offsetValue = options?.offset ?? 5;
    const applyWidth = options?.applyWidth ?? true;

    // without memoization a fresh middleware array on every render makes
    // useFloating update its state - and the renders loop forever
    const middleware = useMemo<UseFloatingOptions['middleware']>(
        () => [
            offset(offsetValue),
            flip(),
            shift(),
            size({
                apply: (options) => {
                    const floatingRect = options.rects.floating;
                    if (floatingRect.height !== 0) {
                        const rectWidth = options.rects.reference.width;
                        const floatingElement = options.elements.floating;
                        floatingElement.style.setProperty(
                            '--list-box-reference-width',
                            `${rectWidth}px`,
                        );
                        floatingElement.style.setProperty(
                            '--list-box-available-height',
                            `${options.availableHeight}px`,
                        );
                        if (applyWidth) {
                            floatingElement.style.width = `${rectWidth}px`;
                            floatingElement.style.maxWidth = `${
                                rectWidth * 1.5
                            }px`;
                        }
                    }
                },
            }),
        ],
        [offsetValue, applyWidth],
    );

    const floating = useFloating({
        middleware,
        placement,
        // autoUpdate only while open: the guard below swallows setFloating(null),
        // so otherwise the ResizeObserver outlives the close and on a reopen
        // catches the 0 -> height jump ("ResizeObserver loop completed with
        // undelivered notifications").
        whileElementsMounted: isOpen ? autoUpdate : undefined,
        open: isOpen,
    });

    const {setReference, setFloating} = floating.refs;

    // Trigger and Listbox hand over unstable ref callbacks, so React detaches them
    // with null on every render - and floating-ui loops on null. Guard below; see
    // docs/adr/0002-floating-refs-null-guard.md.
    const refs = useMemo(
        () => ({
            ...floating.refs,
            setReference: (node: Element | null) => {
                if (node) {
                    setReference(node);
                }
            },
            setFloating: (node: HTMLElement | null) => {
                if (node) {
                    setFloating(node);
                }
            },
        }),
        [floating.refs, setReference, setFloating],
    );

    return {...floating, refs};
};
