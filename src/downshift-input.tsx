// Created by: Andrey Polyakov (andrey@polyakov.im)

import {mergeProps} from '@react-aria/utils';
import React from 'react';

import {
    useBaseDownshiftContext,
    useDownshiftComboboxContext,
} from './downshiftComboboxContext';
import {preventDownshiftDefault} from './utils';
import type * as Radix from '@radix-ui/react-primitive';
import {Slot} from '@radix-ui/react-slot';

export type DownshiftInputElement = React.ElementRef<typeof Radix.Primitive.input>;
export type DownshiftInputProps = Radix.ComponentPropsWithoutRef<typeof Radix.Primitive.input>;

export const DownshiftInput = React.forwardRef<
    DownshiftInputElement,
    DownshiftInputProps
>((props, ref): React.ReactElement | null => {
    const {asChild, ...rest} = props;
    const {isDisabled} = useBaseDownshiftContext('DownshiftInput');
    const {isFocused, downshiftProps, setIsFocused} =
        useDownshiftComboboxContext('DownshiftInput');
    const {selectedItem, getInputProps, toggleMenu, highlightedIndex, isOpen} =
        downshiftProps;

    const inputProps = getInputProps({
        disabled: isDisabled,
        ref,
        onClick: () => {
            if (!isOpen) {
                toggleMenu();
            }
        },
        onFocusCapture: () => {
            setIsFocused(true);
        },
        onBlurCapture: () => {
            setIsFocused(false);
        },
        onKeyDown: (event) => {
            if (event.key === 'ArrowUp' && [0, -1].includes(highlightedIndex)) {
                preventDownshiftDefault(event);
            }
        },
    });

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
