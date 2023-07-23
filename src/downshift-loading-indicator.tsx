// Created by: Andrey Polyakov (andrey@polyakov.im)
import {Slot} from '@radix-ui/react-slot';
import React from 'react';

import {useBaseDownshiftContext} from './downshiftComboboxContext';

export interface DownshiftLoadingIndicatorProps
    extends React.ComponentPropsWithoutRef<'span'> {
    forceMount?: boolean;
    asChild?: boolean;
    children: React.ReactNode;
}

export const DownshiftLoadingIndicator = React.forwardRef<
    HTMLSpanElement,
    DownshiftLoadingIndicatorProps
>((props, ref): React.ReactElement | null => {
    const {isLoading, loadingState} = useBaseDownshiftContext(
        'DownshiftLoadingIndicator',
    );
    const {forceMount, asChild, ...rest} = props;

    if (!isLoading && !forceMount) {
        return null;
    }
    const Component = asChild ? Slot : 'span';

    return (
        <Component
            {...rest}
            ref={ref}
            data-is-loading={isLoading}
            data-loading-state={loadingState}
        />
    );
});
