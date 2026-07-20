// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import React, {useMemo} from 'react';

import {useBaseDownshiftContext} from './downshiftComboboxContext';
import {useIsDownshiftLoading} from './hooks/useIsDownshiftLoading';
import * as Radix from '@radix-ui/react-primitive';

export type DownshiftOptionStateElement = React.ElementRef<
    typeof Radix.Primitive.div
>;

export interface DownshiftOptionStateProps
    extends Radix.ComponentPropsWithoutRef<typeof Radix.Primitive.div> {
    forceMount?: boolean;
    type: 'loading' | 'loadingMore' | 'noResults' | 'error';
}

export const DownshiftOptionState = React.forwardRef<
    DownshiftOptionStateElement,
    DownshiftOptionStateProps
>((props, ref): React.ReactElement | null => {
    const {loadingState, downshiftProps, items} =
        useBaseDownshiftContext('DownshiftListBox');
    const isLoading = useIsDownshiftLoading();
    const {isOpen} = downshiftProps;
    const {asChild, forceMount, type, ...rest} = props;

    const isVisible = useMemo<boolean>(() => {
        if (isOpen) {
            switch (type) {
                case 'loading':
                    return ['loading', 'sorting', 'filtering'].includes(
                        loadingState,
                    );
                case 'loadingMore':
                    return loadingState === 'loadingMore';
                case 'noResults':
                    return loadingState === 'idle' && items.length === 0;
                case 'error':
                    return loadingState === 'error';
                default:
                    return false;
            }
        }
        return false;
    }, [type, isOpen, loadingState]);

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

export const OptionState = DownshiftOptionState;
