// Created by: Andrey Polyakov (andrey@polyakov.im)
import {Slot} from '@radix-ui/react-slot';
import React from 'react';

import {useBaseDownshiftContext} from './downshiftComboboxContext';
import * as Radix from '@radix-ui/react-primitive';

export type DownshiftLoadingIndicatorElement = React.ElementRef<
    typeof Radix.Primitive.span
>;

export interface DownshiftLoadingIndicatorProps
    extends React.ComponentPropsWithoutRef<typeof Radix.Primitive.span> {
    forceMount?: boolean;
    children: React.ReactNode;
}

export const DownshiftLoadingIndicator = React.forwardRef<
    DownshiftLoadingIndicatorElement,
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

export const LoadingIndicator = DownshiftLoadingIndicator;
