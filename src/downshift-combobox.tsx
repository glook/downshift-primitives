// Created by: Andrey Polyakov (andrey@polyakov.im)

import {
    useCombobox,
    UseComboboxProps,
    UseComboboxState,
    UseComboboxStateChangeOptions,
} from 'downshift';
import React, {useEffect, useState} from 'react';
import {useDebounce} from 'use-debounce';

import {
    BaseDownshiftContextProvider,
    DownshiftComboboxProvider,
} from './downshiftComboboxContext';
import {useDownshiftAsyncList} from './hooks/useDownshiftAsyncList';
import {useDropdownMenuFloating} from './hooks/useDropdownMenuFloating';
import {objectFilterUndefinedValues} from './utils';
import {DownshiftProps} from './interface.ts';

interface DownshiftComboboxProps<Item, Cursor>
    extends DownshiftProps<Item, Cursor>,
        Pick<
            UseComboboxProps<Item>,
            | 'initialInputValue'
            | 'onSelectedItemChange'
            | 'selectedItem'
            | 'isItemDisabled'
        >,
        Required<Pick<UseComboboxProps<Item>, 'itemToString'>> {
    debounceTime?: number;
}

export const DownshiftCombobox = <T, C>(
    props: DownshiftComboboxProps<T, C>,
): React.ReactElement => {
    const {
        selectedItem,
        disabled,
        itemToString,
        debounceTime = 0,
        renderSelectedItem,
        isLoading, // input
        dropdownMenuFloatingOptions,
        initialInputValue = '',
        children,
        isItemDisabled,
        onSelectedItemChange,
    } = props;
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
    const [highlightedIndex, setHighlightedIndex] = useState<
        number | undefined
    >(undefined);

    const {
        items,
        loadingState,
        isLoading: isAsyncListLoading,
        setFilterText,
        clearItems,
        listBoxProps,
    } = useDownshiftAsyncList({...props, highlightedIndex});

    const comboboxMethods = useCombobox(
        objectFilterUndefinedValues<UseComboboxProps<T>>({
            items,
            selectedItem,
            initialInputValue,
            onSelectedItemChange,
            onHighlightedIndexChange: (changes) => {
                setHighlightedIndex(changes.highlightedIndex);
            },
            isItemDisabled,
            itemToString,
            stateReducer: (
                state: UseComboboxState<T>,
                actionAndChanges: UseComboboxStateChangeOptions<T>,
            ) => {
                const {changes, type} = actionAndChanges;
                switch (type) {
                    case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
                        if (
                            changes.highlightedIndex &&
                            changes.highlightedIndex < state.highlightedIndex
                        ) {
                            return {
                                ...changes,
                                highlightedIndex: state.highlightedIndex,
                            };
                        }
                        return changes;
                    case useCombobox.stateChangeTypes.InputKeyDownArrowUp:
                        if (
                            changes.highlightedIndex &&
                            changes.highlightedIndex > state.highlightedIndex
                        ) {
                            return {
                                ...changes,
                                highlightedIndex: state.highlightedIndex,
                            };
                        }
                        return changes;
                    default:
                        return changes;
                }
            },
        }),
    );

    const {isOpen, toggleMenu, inputValue} = comboboxMethods;
    const [debouncedFilter] = useDebounce(inputValue, debounceTime);

    useEffect(() => {
        setFilterText(debouncedFilter);
    }, [debouncedFilter]);

    useEffect(() => {
        if (isInputFocused && !isOpen) {
            toggleMenu();
        }
    }, [isInputFocused]);

    useEffect(() => {
        if (isOpen) {
            setFilterText(inputValue);
        } else {
            clearItems();
        }
    }, [isOpen]);

    const dropdownMenuFloatingProps = useDropdownMenuFloating(
        isOpen,
        dropdownMenuFloatingOptions,
    );

    const [isHovered, setIsHovered] = useState<boolean>(false);
    return (
        <BaseDownshiftContextProvider
            downshiftProps={comboboxMethods}
            dropdownMenuFloatingProps={dropdownMenuFloatingProps}
            items={items}
            loadingState={loadingState}
            isLoading={isAsyncListLoading || isLoading}
            isHovered={isHovered}
            isDisabled={disabled}
            listBoxProps={listBoxProps}
            setIsHovered={setIsHovered}
            type={'combobox'}
            renderSelectedItem={renderSelectedItem}
            isItemDisabled={isItemDisabled}
        >
            <DownshiftComboboxProvider
                downshiftProps={comboboxMethods}
                isFocused={isInputFocused}
                setIsFocused={setIsInputFocused}
            >
                {children}
            </DownshiftComboboxProvider>
        </BaseDownshiftContextProvider>
    );
};
