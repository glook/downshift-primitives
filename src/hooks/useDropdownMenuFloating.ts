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
}

export const useDropdownMenuFloating = (
    isOpen: boolean,
    options?: DropdownMenuFloatingOptions,
) => {
    const placement = options?.placement ?? 'bottom-start';
    const offsetValue = options?.offset ?? 5;
    return useFloating({
        middleware: [
            offset(offsetValue),
            flip(),
            shift(),
            size({
                apply(options) {
                    if (!options.elements.floating.style.minWidth) {
                        const {reference} = options.elements;
                        const {width} = reference.getBoundingClientRect();
                        Object.assign(options.elements.floating.style, {
                            minWidth: `${width}px`,
                            maxWidth: `${width * 1.5}px`,
                        });
                    }
                },
            }),
        ],
        placement,
        whileElementsMounted: autoUpdate,
        open: isOpen,
    });
};
