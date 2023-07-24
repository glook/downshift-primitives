// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import React from 'react';

import {
    useBaseDownshiftContext,
    useDownshiftSelectContext,
} from './downshiftComboboxContext';
import * as Radix from '@radix-ui/react-primitive';

export type DownshiftSelectPlaceholderElement = React.ElementRef<typeof Radix.Primitive.span>;

export interface DownshiftSelectPlaceholderProps
    extends Radix.ComponentPropsWithoutRef<typeof Radix.Primitive.span>{
    asChild?: boolean;
    forceMount?: boolean;
}

export const DownshiftSelectPlaceholder = React.forwardRef<
    DownshiftSelectPlaceholderElement,
    DownshiftSelectPlaceholderProps
>((props, ref): React.ReactElement | null => {
    const {isHovered} = useBaseDownshiftContext('DownshiftSelectPlaceholder');
    const {downshiftProps} = useDownshiftSelectContext(
        'DownshiftSelectPlaceholder',
    );
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
