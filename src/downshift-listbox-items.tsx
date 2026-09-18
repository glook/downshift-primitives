// Created by: Andrey Polyakov (andrey@polyakov.im)

import React, {useMemo} from 'react';

import {useBaseDownshiftContext} from './downshiftComboboxContext';
import type {LoadingState} from './interface';

export interface DownshiftListBoxValue<T> {
    value: string;
    rawValue: T;
    index: number;
    isSelected: boolean;
    isDisabled: boolean;
    isHighlighted: boolean;
}

export interface DownshiftListBoxItemsChildrenProps<T> {
    values: DownshiftListBoxValue<T>[];
    loadingState: LoadingState;
    inputValue?: string;
}

export interface DownshiftListBoxItemsProps<T> {
    /** Overrides the root's getOptionValue for this list only. */
    getOptionValue?: (value: T) => string;
    children: (props: DownshiftListBoxItemsChildrenProps<T>) => React.ReactNode;
}

export const DownshiftListBoxItems = <T,>(
    props: DownshiftListBoxItemsProps<T>,
): React.ReactElement | null => {
    const {
        loadingState,
        items,
        downshiftProps,
        isItemDisabled,
        getOptionValue: rootGetOptionValue,
    } = useBaseDownshiftContext('DownshiftListBoxItems');

    const listboxItems = items as T[];
    const {selectedItem, highlightedIndex, inputValue} = downshiftProps;
    const {getOptionValue = rootGetOptionValue, children} = props;

    const selectedItemValue = selectedItem
        ? getOptionValue(selectedItem)
        : undefined;

    const listBoxValues = useMemo<DownshiftListBoxValue<T>[]>(
        () =>
            listboxItems.map((item, index, array) => {
                const optionValue = getOptionValue(item);
                return {
                    rawValue: item,
                    value: optionValue,
                    index,
                    isDisabled: isItemDisabled
                        ? isItemDisabled(item, index)
                        : false,
                    isSelected: selectedItemValue === optionValue,
                    isHighlighted: highlightedIndex === index,
                };
            }),
        [
            listboxItems,
            isItemDisabled,
            getOptionValue,
            selectedItemValue,
            highlightedIndex,
        ],
    );

    const childrenElement = useMemo(
        () =>
            children({
                loadingState,
                inputValue,
                values: listBoxValues,
            }),
        [loadingState, inputValue, listBoxValues],
    );

    return <>{childrenElement}</>;
};

export const ListBoxItems = DownshiftListBoxItems;
