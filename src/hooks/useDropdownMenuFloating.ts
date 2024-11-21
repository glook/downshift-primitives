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
    return useFloating({
        middleware: [
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
                        if(applyWidth) {
                            floatingElement.style.width = `${rectWidth}px`;
                            floatingElement.style.maxWidth = `${rectWidth * 1.5}px`;
                        }

                    }
                },
            }),
        ],
        placement,
        whileElementsMounted: autoUpdate,
        open: isOpen,
    });
};
