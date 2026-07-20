// Created by: Andrey Polyakov (andrey@polyakov.im)

import {mergeProps} from '@react-aria/utils';
import React from 'react';

import {
    useBaseDownshiftContext,
    useDownshiftComboboxContext,
    useDownshiftMultiComboboxContext,
} from './downshiftComboboxContext';
import {preventDownshiftDefault} from './utils';
import type * as Radix from '@radix-ui/react-primitive';
import {Slot} from '@radix-ui/react-slot';

export type DownshiftInputElement = HTMLInputElement;
export type DownshiftInputProps = React.ComponentPropsWithoutRef<
    typeof Radix.Primitive.input
>;

interface InputStateProps {
    isDisabled?: boolean;
    hasSelectedItem: boolean;
    placeholder?: string;
    setIsFocused: (value: boolean) => void;
    openMenu: () => void;
    highlightedIndex: number;
    ref: React.ForwardedRef<DownshiftInputElement>;
}

const getInputStateProps = (props: InputStateProps) => {
    const {
        isDisabled,
        hasSelectedItem,
        placeholder,
        setIsFocused,
        openMenu,
        highlightedIndex,
        ref,
    } = props;

    return {
        disabled: isDisabled,
        ref,
        // openMenu and not toggleMenu: focus already opens the menu from an effect,
        // while toggleMenu here sees a stale isOpen and would close it right back
        onClick: () => {
            openMenu();
        },
        placeholder: !hasSelectedItem ? placeholder : undefined,
        onFocusCapture: () => {
            setIsFocused(true);
        },
        onBlurCapture: () => {
            setIsFocused(false);
        },
        onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === 'ArrowUp' && [0, -1].includes(highlightedIndex)) {
                preventDownshiftDefault(event);
            }
        },
    };
};

const DownshiftComboboxInput = React.forwardRef<
    DownshiftInputElement,
    DownshiftInputProps
>((props, ref): React.ReactElement => {
    const {asChild, placeholder, ...rest} = props;
    const {isDisabled} = useBaseDownshiftContext('DownshiftInput');
    const {isFocused, downshiftProps, setIsFocused} =
        useDownshiftComboboxContext('DownshiftInput');
    const {selectedItem, getInputProps, openMenu, highlightedIndex} =
        downshiftProps;

    const inputProps = getInputProps(
        getInputStateProps({
            isDisabled,
            hasSelectedItem: !!selectedItem,
            placeholder,
            setIsFocused,
            openMenu,
            highlightedIndex,
            ref,
        }),
    );

    const Component = asChild ? Slot : 'input';

    return (
        <Component
            {...mergeProps(inputProps, rest)}
            data-disabled={isDisabled}
            data-is-focused={isFocused}
            data-has-selected-item={!!selectedItem}
        />
    );
});

const DownshiftMultiComboboxInput = React.forwardRef<
    DownshiftInputElement,
    DownshiftInputProps
>((props, ref): React.ReactElement => {
    const {asChild, placeholder, ...rest} = props;
    const {isDisabled} = useBaseDownshiftContext('DownshiftInput');
    const {isFocused, downshiftProps, setIsFocused} =
        useDownshiftComboboxContext('DownshiftInput');
    const {selectedItems, getDropdownProps} =
        useDownshiftMultiComboboxContext('DownshiftInput');
    const {getInputProps, openMenu, highlightedIndex, isOpen} = downshiftProps;

    // getDropdownProps wires up keyboard navigation over the chips (arrows, Backspace)
    const inputProps = getInputProps(
        getDropdownProps({
            ...getInputStateProps({
                isDisabled,
                hasSelectedItem: selectedItems.length > 0,
                placeholder,
                setIsFocused,
                openMenu,
                highlightedIndex,
                ref,
            }),
            preventKeyAction: isOpen,
        }),
    );

    const Component = asChild ? Slot : 'input';

    return (
        <Component
            {...mergeProps(inputProps, rest)}
            data-disabled={isDisabled}
            data-is-focused={isFocused}
            data-has-selected-item={selectedItems.length > 0}
        />
    );
});

export const DownshiftInput = React.forwardRef<
    DownshiftInputElement,
    DownshiftInputProps
>((props, ref): React.ReactElement | null => {
    const {type} = useBaseDownshiftContext('DownshiftInput');

    if (type === 'select') {
        return null;
    }

    const Component =
        type === 'multi-combobox'
            ? DownshiftMultiComboboxInput
            : DownshiftComboboxInput;

    return <Component {...props} ref={ref} />;
});

export const Input = DownshiftInput;
