// Created by: Andrey Polyakov (andrey@polyakov.im)

import {useCombobox, UseComboboxProps} from 'downshift';
import React, {useState} from 'react';

import {
    BaseDownshiftContextProvider,
    DownshiftComboboxProvider,
} from './downshiftComboboxContext';
import {useDownshiftAsyncList} from './hooks/useDownshiftAsyncList';
import {
    useComboboxStateReducer,
    useDownshiftComboboxCore,
} from './hooks/useDownshiftComboboxCore';
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

    const comboboxStateReducer = useComboboxStateReducer<T>(stateReducer);

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

    const dropdownMenuFloatingProps = useDownshiftComboboxCore<T>({
        comboboxMethods,
        setFilterText,
        clearItems,
        isInputFocused,
        debounceTime,
        dropdownMenuFloatingOptions,
    });

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
            hasSelectedItem={!!comboboxMethods.selectedItem}
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
