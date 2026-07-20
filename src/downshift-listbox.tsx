// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import {mergeProps, mergeRefs} from '@react-aria/utils';
import React, {useEffect} from 'react';

import {useBaseDownshiftContext} from './downshiftComboboxContext';
import {useIsDownshiftLoading} from './hooks/useIsDownshiftLoading';
import * as Radix from '@radix-ui/react-primitive';

export type DownshiftListboxElement = HTMLDivElement;
export type DownshiftListboxProps = React.ComponentPropsWithoutRef<
    typeof Radix.Primitive.div
>;

export const DownshiftListbox = React.forwardRef<
    DownshiftListboxElement,
    DownshiftListboxProps
>((props: DownshiftListboxProps, ref): React.ReactElement => {
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
    const Component = asChild ? Slot : 'div';
    const listboxRef = React.useRef<DownshiftListboxElement>(null);

    const menuProps = getMenuProps<DownshiftListboxProps>({
        // mergeRefs returns Ref<T | null> for React 19 compatibility, which
        // @types/react@18 rejects as a LegacyRef<T> - the cast keeps a single
        // source that typechecks on both.
        ref: mergeRefs(
            isOpen ? dropdownMenuFloatingProps.refs.setFloating : null,
            ref,
            listboxRef,
        ) as React.Ref<DownshiftListboxElement>,

        style: {
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            ...style,
        },
        ...mergeProps(rest, listBoxProps),
    });

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

export const Listbox = DownshiftListbox;
