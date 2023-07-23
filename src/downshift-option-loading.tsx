// Created by: Andrey Polyakov (andrey@polyakov.im)

import React from 'react';

import {DownshiftOptionState} from './downshift-option-state';
import {useBaseDownshiftContext} from './downshiftComboboxContext';

export interface DownshiftOptionLoadingProps
    extends React.ComponentPropsWithoutRef<'li'> {
    asChild?: boolean;
    forceMount?: boolean;
}

export const DownshiftOptionLoading = React.forwardRef<
    HTMLLIElement,
    DownshiftOptionLoadingProps
>((props, ref): React.ReactElement | null => {
    const {downshiftProps, loadingState} =
        useBaseDownshiftContext('DownshiftListBox');
    const {isOpen} = downshiftProps;
    const isVisible =
        isOpen && ['loading', 'sorting', 'filtering'].includes(loadingState);
    return <DownshiftOptionState {...props} isVisible={isVisible} ref={ref} />;
});

export const DownshiftOptionLoadingMore = React.forwardRef<
    HTMLLIElement,
    DownshiftOptionLoadingProps
>((props, ref): React.ReactElement | null => {
    const {downshiftProps, loadingState} =
        useBaseDownshiftContext('DownshiftListBox');
    const {isOpen} = downshiftProps;
    const isVisible = isOpen && loadingState === 'loadingMore';
    return <DownshiftOptionState {...props} isVisible={isVisible} ref={ref} />;
});
