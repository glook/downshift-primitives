// Created by: Andrey Polyakov (andrey@polyakov.im)

import {
    useCombobox,
    UseComboboxProps,
    UseComboboxState,
    UseComboboxStateChangeOptions,
} from 'downshift';
import React, {useCallback, useEffect, useState} from 'react';
import {useDebounce} from 'use-debounce';

import {
    BaseDownshiftContextProvider,
    DownshiftComboboxProvider,
} from './downshiftComboboxContext';
import {useDownshiftAsyncList} from './hooks/useDownshiftAsyncList';
import {useDropdownMenuFloating} from './hooks/useDropdownMenuFloating';
import {objectFilterUndefinedValues} from './utils';
import {DownshiftProps} from './interface';

export interface DownshiftComboboxProps<Item, Cursor>
    extends DownshiftProps<Item, Cursor>,
        Omit<
            UseComboboxProps<Item>,
            | 'items'| 'itemToString'
        >,
        Required<Pick<UseComboboxProps<Item>, 'itemToString'>> {
    debounceTime?: number;
}

export const DownshiftCombobox = <T, C>(
    props: DownshiftComboboxProps<T, C>,
): React.ReactElement => {
    const {
        disabled,
        debounceTime = 0,
        renderSelectedItem,
        isLoading, // input
        dropdownMenuFloatingOptions,
        initialInputValue = '',
        children,
        isItemDisabled,
        stateReducer,
        onHighlightedIndexChange,
        ...comboboxProps
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

    const comboboxStateReducer = useCallback(
        (
            state: UseComboboxState<T>,
            actionAndChanges: UseComboboxStateChangeOptions<T>,
        ): Partial<UseComboboxState<T>> => {
            const {type} = actionAndChanges;
            const changes = stateReducer
                ? stateReducer(state, actionAndChanges)
                : actionAndChanges.changes;
            // disable circular navigation
            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
                    if (
                        changes.highlightedIndex !== undefined &&
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
                        changes.highlightedIndex !== undefined &&
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
        [stateReducer],
    );

    const comboboxMethods = useCombobox(
        objectFilterUndefinedValues<UseComboboxProps<T>>({
            items,
            initialInputValue,
            isItemDisabled,
            onHighlightedIndexChange: (changes) => {
                setHighlightedIndex(changes.highlightedIndex);
                if (onHighlightedIndexChange) {
                    onHighlightedIndexChange(changes);
                }
            },
            stateReducer: comboboxStateReducer,
            ...comboboxProps,
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

export const Combobox = DownshiftCombobox;