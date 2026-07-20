// Created by: Andrey Polyakov (andrey@polyakov.im)

import {
    useCombobox,
    UseComboboxProps,
    UseComboboxState,
    UseComboboxStateChangeOptions,
    useMultipleSelection,
} from 'downshift';
import React, {useCallback, useMemo, useState} from 'react';

import {
    BaseDownshiftContextProvider,
    DownshiftComboboxProvider,
    DownshiftMultiComboboxProvider,
} from './downshiftComboboxContext';
import {useDownshiftAsyncList} from './hooks/useDownshiftAsyncList';
import {
    useComboboxStateReducer,
    useDownshiftComboboxCore,
} from './hooks/useDownshiftComboboxCore';
import {DownshiftProps} from './interface';
import {objectFilterUndefinedValues} from './utils';

export interface DownshiftMultiComboboxProps<Item, Cursor>
    extends DownshiftProps<Item, Cursor>,
        Omit<
            UseComboboxProps<Item>,
            'items' | 'itemToString' | 'selectedItem' | 'initialSelectedItem'
        > {
    selectedItems: Item[];
    onChange: (items: Item[]) => void;
    // used to compare items: selected ones are hidden from the list by this value
    getOptionValue: (item: Item) => string;
    itemToString?: (item: Item | null) => string;
    debounceTime?: number;
}

export const DownshiftMultiCombobox = <T, C>(
    props: DownshiftMultiComboboxProps<T, C>,
): React.ReactElement => {
    const {
        selectedItems,
        onChange,
        getOptionValue,
        itemToString,
        disabled,
        debounceTime = 0,
        renderSelectedItem,
        isLoading,
        dropdownMenuFloatingOptions,
        initialInputValue = '',
        children,
        isItemDisabled,
        stateReducer,
        onHighlightedIndexChange,
        ...comboboxProps
    } = props;

    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);
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

    // selected items are dropped from the list before useCombobox: otherwise the
    // getItemProps indexes would drift apart from what is actually rendered
    const visibleItems = useMemo<T[]>(() => {
        const selectedValues = new Set(selectedItems.map(getOptionValue));
        return items.filter(
            (item) => !selectedValues.has(getOptionValue(item)),
        );
    }, [items, selectedItems, getOptionValue]);

    const {
        getSelectedItemProps,
        getDropdownProps,
        removeSelectedItem,
        activeIndex,
    } = useMultipleSelection<T>({
        selectedItems,
        onStateChange({selectedItems: newSelectedItems, type}) {
            switch (type) {
                case useMultipleSelection.stateChangeTypes
                    .SelectedItemKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes
                    .SelectedItemKeyDownDelete:
                case useMultipleSelection.stateChangeTypes
                    .DropdownKeyDownBackspace:
                case useMultipleSelection.stateChangeTypes
                    .FunctionRemoveSelectedItem:
                    onChange(newSelectedItems ?? []);
                    break;
                default:
                    break;
            }
        },
    });

    // after a selection the menu stays open and the input is cleared: handy for
    // picking several values in a row, the list is refetched with an empty filter
    const multiStateReducer = useCallback(
        (
            state: UseComboboxState<T>,
            actionAndChanges: UseComboboxStateChangeOptions<T>,
        ): Partial<UseComboboxState<T>> => {
            const {type} = actionAndChanges;
            const changes = stateReducer
                ? stateReducer(state, actionAndChanges)
                : actionAndChanges.changes;

            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownEnter:
                case useCombobox.stateChangeTypes.ItemClick:
                    return {
                        ...changes,
                        isOpen: true,
                        inputValue: '',
                        // the picked item is about to leave visibleItems: without
                        // clamping the highlight would land past the end of the list
                        highlightedIndex: Math.min(
                            state.highlightedIndex,
                            visibleItems.length - 2,
                        ),
                    };
                default:
                    return changes;
            }
        },
        [stateReducer, visibleItems],
    );

    const comboboxStateReducer = useComboboxStateReducer<T>(multiStateReducer);

    const comboboxMethods = useCombobox(
        objectFilterUndefinedValues<UseComboboxProps<T>>({
            items: visibleItems,
            initialInputValue,
            isItemDisabled,
            selectedItem: null,
            itemToString: itemToString
                ? itemToString
                : (item) => (item == null ? '' : getOptionValue(item)),
            onHighlightedIndexChange: (changes) => {
                setHighlightedIndex(changes.highlightedIndex);
                if (onHighlightedIndexChange) {
                    onHighlightedIndexChange(changes);
                }
            },
            stateReducer: comboboxStateReducer,
            onStateChange: ({type, selectedItem}) => {
                switch (type) {
                    case useCombobox.stateChangeTypes.InputKeyDownEnter:
                    case useCombobox.stateChangeTypes.ItemClick:
                        if (selectedItem != null) {
                            onChange([...selectedItems, selectedItem]);
                        }
                        break;
                    default:
                        break;
                }
            },
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

    return (
        <BaseDownshiftContextProvider
            downshiftProps={comboboxMethods}
            dropdownMenuFloatingProps={dropdownMenuFloatingProps}
            items={visibleItems}
            loadingState={loadingState}
            isLoading={isAsyncListLoading || isLoading}
            isHovered={isHovered}
            isDisabled={disabled}
            listBoxProps={listBoxProps}
            setIsHovered={setIsHovered}
            type={'multi-combobox'}
            renderSelectedItem={renderSelectedItem}
            isItemDisabled={isItemDisabled}
            hasSelectedItem={selectedItems.length > 0}
        >
            <DownshiftComboboxProvider
                downshiftProps={comboboxMethods}
                isFocused={isInputFocused}
                setIsFocused={setIsInputFocused}
            >
                <DownshiftMultiComboboxProvider
                    selectedItems={selectedItems}
                    activeIndex={activeIndex}
                    getOptionValue={getOptionValue}
                    getSelectedItemProps={getSelectedItemProps}
                    getDropdownProps={getDropdownProps}
                    removeSelectedItem={removeSelectedItem}
                    onChange={onChange}
                >
                    {children}
                </DownshiftMultiComboboxProvider>
            </DownshiftComboboxProvider>
        </BaseDownshiftContextProvider>
    );
};

export const MultiCombobox = DownshiftMultiCombobox;
