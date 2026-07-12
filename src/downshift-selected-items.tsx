// Created by: Andrey Polyakov (andrey@polyakov.im)

import React, {useMemo} from 'react';

import {
    useBaseDownshiftContext,
    useDownshiftMultiComboboxContext,
} from './downshiftComboboxContext';

export interface DownshiftSelectedItemValue<T> {
    rawValue: T;
    value: string;
    index: number;
    isActive: boolean;
}

export interface DownshiftSelectedItemsChildrenProps<T> {
    values: DownshiftSelectedItemValue<T>[];
}

export interface DownshiftSelectedItemsProps<T> {
    children: (
        props: DownshiftSelectedItemsChildrenProps<T>,
    ) => React.ReactNode;
}

const MultiComboboxSelectedItems = <T,>(
    props: DownshiftSelectedItemsProps<T>,
): React.ReactElement => {
    const {selectedItems, activeIndex, getOptionValue} =
        useDownshiftMultiComboboxContext('DownshiftSelectedItems');
    const {children} = props;

    const values = useMemo<DownshiftSelectedItemValue<T>[]>(
        () =>
            (selectedItems as T[]).map((rawValue, index) => ({
                rawValue,
                value: getOptionValue(rawValue),
                index,
                isActive: activeIndex === index,
            })),
        [selectedItems, activeIndex, getOptionValue],
    );

    return <>{children({values})}</>;
};

// dispatcher: chips only exist in multi-combobox, but hooks cannot be called after
// an early return - hence the type check out here and the hooks in the inner component
export const DownshiftSelectedItems = <T,>(
    props: DownshiftSelectedItemsProps<T>,
): React.ReactElement | null => {
    const {type} = useBaseDownshiftContext('DownshiftSelectedItems');

    if (type !== 'multi-combobox') {
        return null;
    }

    return <MultiComboboxSelectedItems<T> {...props} />;
};

export const SelectedItems = DownshiftSelectedItems;
