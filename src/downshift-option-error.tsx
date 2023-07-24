// Created by: Andrey Polyakov (andrey@polyakov.im)

import React from 'react';

import {
    DownshiftOptionState,
    DownshiftOptionStateComponentProps,
    DownshiftOptionStateElement,
} from './downshift-option-state';
import {useBaseDownshiftContext} from './downshiftComboboxContext';

export const DownshiftOptionError = React.forwardRef<
    DownshiftOptionStateElement,
    DownshiftOptionStateComponentProps
>((props, ref): React.ReactElement | null => {
    const {loadingState, downshiftProps} =
        useBaseDownshiftContext('DownshiftListBox');
    const {isOpen} = downshiftProps;
    const isVisible = isOpen && loadingState === 'error';

    return <DownshiftOptionState {...props} isVisible={isVisible} ref={ref} />;
});
