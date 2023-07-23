// Created by: Andrey Polyakov (andrey@polyakov.im)

import {mergeProps} from '@react-aria/utils';
import React from 'react';

import {
    useBaseDownshiftContext,
    useDownshiftComboboxContext,
} from './downshiftComboboxContext';
import {preventDownshiftDefault} from './utils';

export const DownshiftInput = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>((props, ref): React.ReactElement | null => {
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

    return (
        <input
            {...mergeProps(inputProps, props)}
            data-disabled={isDisabled}
            data-is-focused={isFocused}
            data-has-selected-item={!!selectedItem}
        />
    );
});
