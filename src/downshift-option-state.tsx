// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import React from 'react';

import {useBaseDownshiftContext} from './downshiftComboboxContext';
import {useIsDownshiftLoading} from './hooks/useIsDownshiftLoading';
import * as Radix from '@radix-ui/react-primitive';

export type DownshiftOptionStateElement = React.ElementRef<typeof Radix.Primitive.div>;

export interface DownshiftOptionStateComponentProps
    extends Radix.ComponentPropsWithoutRef<typeof Radix.Primitive.div> {
    forceMount?: boolean;
}

export interface DownshiftOptionStateProps
    extends DownshiftOptionStateComponentProps {
    isVisible: boolean;
}

export const DownshiftOptionState = React.forwardRef<
    DownshiftOptionStateElement,
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
    const Component = asChild ? Slot : 'div';

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
