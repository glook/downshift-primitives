// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import {mergeProps, mergeRefs} from '@react-aria/utils';
import React, {useEffect} from 'react';

import {useBaseDownshiftContext} from './downshiftComboboxContext';
import {useIsDownshiftLoading} from './hooks/useIsDownshiftLoading';

export interface DownshiftListboxContainerProps
    extends React.HTMLProps<HTMLUListElement> {
    asChild?: boolean;
}

export const DownshiftListboxContainer = React.forwardRef<
    HTMLUListElement,
    DownshiftListboxContainerProps
>((props: DownshiftListboxContainerProps, ref): React.ReactElement => {
    const isLoading = useIsDownshiftLoading();
    const {
        loadingState,
        listBoxProps,
        dropdownMenuFloatingProps,
        downshiftProps,
        items,
    } = useBaseDownshiftContext('DownshiftListBox');
    const {getMenuProps, isOpen, inputValue} = downshiftProps;
    const {strategy, x, y} = dropdownMenuFloatingProps;
    const {children, style, asChild, ...rest} = props;
    const Component = asChild ? Slot : 'ul';
    const listboxRef = React.useRef<HTMLUListElement>(null);

    const menuProps = getMenuProps<React.ComponentPropsWithoutRef<'ul'>>({
        ref: mergeRefs(
            isOpen ? dropdownMenuFloatingProps.refs.setFloating : null,
            ref,
            listboxRef,
        ),

        style: {
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
        },
        ...mergeProps(rest, listBoxProps),
    });

    // If the value in the input changes, scroll the list up
    useEffect(() => {
        if (listboxRef.current) {
            listboxRef.current.scrollTop = 0;
        }
    }, [inputValue]);

    return (
        <Component
            {...menuProps}
            data-is-open={isOpen}
            data-has-error={isOpen && loadingState === 'error'}
            data-is-loading={isOpen && isLoading}
            data-loading-state={loadingState}
            data-has-no-items={isOpen && !items.length}
        >
            {children}
        </Component>
    );
});
