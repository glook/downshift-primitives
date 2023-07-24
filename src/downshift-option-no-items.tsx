// Created by: Andrey Polyakov (andrey@polyakov.im)

import React from 'react';

import {DownshiftOptionState, DownshiftOptionStateElement} from './downshift-option-state';
import {useBaseDownshiftContext} from './downshiftComboboxContext';
import * as Radix from '@radix-ui/react-primitive';

export interface DownshiftOptionNoItemsProps
    extends Radix.ComponentPropsWithoutRef<typeof Radix.Primitive.div>{
    forceMount?: boolean;
}

export const DownshiftOptionNoItems = React.forwardRef<
    DownshiftOptionStateElement,
    DownshiftOptionNoItemsProps
>((props, ref): React.ReactElement | null => {
    const {loadingState, downshiftProps, items} =
        useBaseDownshiftContext('DownshiftListBox');
    const {isOpen} = downshiftProps;
    const isVisible = isOpen && loadingState === 'idle' && items.length === 0;
    return <DownshiftOptionState {...props} isVisible={isVisible} ref={ref} />;
});
