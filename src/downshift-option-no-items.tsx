// Created by: Andrey Polyakov (andrey@polyakov.im)

import React from 'react';

import {DownshiftOptionState} from './downshift-option-state';
import {useBaseDownshiftContext} from './downshiftComboboxContext';

export interface DownshiftOptionNoItemsProps
    extends React.ComponentPropsWithoutRef<'li'> {
    asChild?: boolean;
    forceMount?: boolean;
}

export const DownshiftOptionNoItems = React.forwardRef<
    HTMLLIElement,
    DownshiftOptionNoItemsProps
>((props, ref): React.ReactElement | null => {
    const {loadingState, downshiftProps, items} =
        useBaseDownshiftContext('DownshiftListBox');
    const {isOpen} = downshiftProps;
    const isVisible = isOpen && loadingState === 'idle' && items.length === 0;
    return <DownshiftOptionState {...props} isVisible={isVisible} ref={ref} />;
});
