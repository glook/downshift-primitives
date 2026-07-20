// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import React from 'react';

import {useBaseDownshiftContext} from './downshiftComboboxContext';
import * as Radix from '@radix-ui/react-primitive';

export type DownshiftArrowElement = HTMLSpanElement;
export type DownshiftArrowProps = React.ComponentPropsWithoutRef<
    typeof Radix.Primitive.span
>;

export const DownshiftArrow = React.forwardRef<
    DownshiftArrowElement,
    DownshiftArrowProps
>((props, ref): React.ReactElement | null => {
    const {downshiftProps} = useBaseDownshiftContext('DownshiftArrow');
    const {isOpen} = downshiftProps;
    const {asChild, children, ...rest} = props;
    const Component = asChild ? Slot : 'span';
    return (
        <Component
            role={'button'}
            tabIndex={-1}
            data-is-open={isOpen}
            {...rest}
            ref={ref}
        >
            {children ? children : <>▼</>}
        </Component>
    );
});

export const Arrow = DownshiftArrow;
