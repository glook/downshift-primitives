// Created by: Andrey Polyakov (andrey@polyakov.im)

import React from 'react';
import {useBaseDownshiftContext} from './downshiftComboboxContext';
import {Slot} from '@radix-ui/react-slot';
import * as Radix from '@radix-ui/react-primitive';

export type DownshiftLabelElement = React.ElementRef<typeof Radix.Primitive.label>;
export type DownshiftLabelProps = Radix.ComponentPropsWithoutRef<typeof Radix.Primitive.label>;

export const DownshiftLabel = React.forwardRef<
    DownshiftLabelElement,
    DownshiftLabelProps
>((props, ref): React.ReactElement => {
    const {downshiftProps} = useBaseDownshiftContext('DownshiftArrow');
    const {getLabelProps} = downshiftProps;
    const {asChild, ...rest} = props;
    const Component = asChild ? Slot : 'label';
    return <Component {...getLabelProps(rest)} ref={ref} />;
});

export const Label = DownshiftLabel;