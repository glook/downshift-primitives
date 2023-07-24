// Created by: Andrey Polyakov (andrey@polyakov.im)

import React from 'react';

import {
    DownshiftOptionState,
    DownshiftOptionStateComponentProps,
    DownshiftOptionStateElement,
} from './downshift-option-state';
import {useBaseDownshiftContext} from './downshiftComboboxContext';

export const DownshiftOptionLoading = React.forwardRef<
    DownshiftOptionStateElement,
    DownshiftOptionStateComponentProps
>((props, ref): React.ReactElement | null => {
    const {downshiftProps, loadingState} =
        useBaseDownshiftContext('DownshiftListBox');
    const {isOpen} = downshiftProps;
    const isVisible =
        isOpen && ['loading', 'sorting', 'filtering'].includes(loadingState);
    return <DownshiftOptionState {...props} isVisible={isVisible} ref={ref} />;
});

export const DownshiftOptionLoadingMore = React.forwardRef<
    DownshiftOptionStateElement,
    DownshiftOptionStateComponentProps
>((props, ref): React.ReactElement | null => {
    const {downshiftProps, loadingState} =
        useBaseDownshiftContext('DownshiftListBox');
    const {isOpen} = downshiftProps;
    const isVisible = isOpen && loadingState === 'loadingMore';
    return <DownshiftOptionState {...props} isVisible={isVisible} ref={ref} />;
});
