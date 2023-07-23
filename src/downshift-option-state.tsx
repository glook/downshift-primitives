// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import React from 'react';

import {useBaseDownshiftContext} from './downshiftComboboxContext';
import {useIsDownshiftLoading} from './hooks/useIsDownshiftLoading';

export interface DownshiftOptionStateProps
    extends React.ComponentPropsWithoutRef<'li'> {
    asChild?: boolean;
    forceMount?: boolean;
    isVisible: boolean;
}

export const DownshiftOptionState = React.forwardRef<
    HTMLLIElement,
    DownshiftOptionStateProps
>((props, ref): React.ReactElement | null => {
    const {loadingState, downshiftProps} =
        useBaseDownshiftContext('DownshiftListBox');
    const isLoading = useIsDownshiftLoading();
    const {isOpen} = downshiftProps;
    const {asChild, forceMount, isVisible, ...rest} = props;

    if (!isVisible && !forceMount) {
        return null;
    }
    const Component = asChild ? Slot : 'li';

    return (
        <Component
            {...rest}
            data-is-open={isOpen}
            data-is-loading={isLoading}
            data-loading-state={loadingState}
            ref={ref}
        />
    );
});
