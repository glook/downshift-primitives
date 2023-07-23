// Created by: Andrey Polyakov (andrey@polyakov.im)

import React from 'react';

import {DownshiftOptionState} from './downshift-option-state';
import {useBaseDownshiftContext} from './downshiftComboboxContext';

export interface DownshiftOptionErrorProps
    extends React.ComponentPropsWithoutRef<'li'> {
    asChild?: boolean;
    forceMount?: boolean;
}

export const DownshiftOptionError = React.forwardRef<
    HTMLLIElement,
    DownshiftOptionErrorProps
>((props, ref): React.ReactElement | null => {
    const {loadingState, downshiftProps} =
        useBaseDownshiftContext('DownshiftListBox');
    const {isOpen} = downshiftProps;
    const isVisible = isOpen && loadingState === 'error';

    return <DownshiftOptionState {...props} isVisible={isVisible} ref={ref} />;
});
