// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import React from 'react';

import {
    useBaseDownshiftContext,
    useDownshiftSelectContext,
} from './downshiftComboboxContext';
import * as Radix from '@radix-ui/react-primitive';

export type DownshiftPlaceholderElement = React.ElementRef<
    typeof Radix.Primitive.span
>;

export interface DownshiftPlaceholderProps
    extends React.ComponentPropsWithoutRef<typeof Radix.Primitive.span> {
    asChild?: boolean;
    forceMount?: boolean;
}

export const DownshiftPlaceholder = React.forwardRef<
    DownshiftPlaceholderElement,
    DownshiftPlaceholderProps
>((props, ref): React.ReactElement | null => {
    const {isHovered, type} = useBaseDownshiftContext('DownshiftPlaceholder');
    if (type !== 'select') {
        return null;
    }
    const {downshiftProps} = useDownshiftSelectContext('DownshiftPlaceholder');
    const {selectedItem} = downshiftProps;
    const {forceMount, asChild, style, ...rest} = props;

    if (selectedItem && !forceMount) {
        return null;
    }

    const Component = asChild ? Slot : 'span';
    return (
        <Component
            {...rest}
            ref={ref}
            style={{userSelect: 'none', ...style}}
            data-is-hovered={isHovered}
        />
    );
});

export const Placeholder = DownshiftPlaceholder;
