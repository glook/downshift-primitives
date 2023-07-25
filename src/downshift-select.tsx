// Created by: Andrey Polyakov (andrey@polyakov.im)

import {useSelect, UseSelectProps} from 'downshift';
import React, {useEffect, useState} from 'react';

import {
    BaseDownshiftContextProvider,
    DownshiftSelectProvider,
} from './downshiftComboboxContext';
import {useDownshiftAsyncList} from './hooks/useDownshiftAsyncList';
import {useDropdownMenuFloating} from './hooks/useDropdownMenuFloating';
import {objectFilterUndefinedValues} from './utils';
import {DownshiftProps} from './interface';

export interface DownshiftSelectProps<Item, Cursor>
    extends DownshiftProps<Item, Cursor>,
        Omit<
            UseSelectProps<Item>,
            'items'
        > {}

export const DownshiftSelect = <T, C>(
    props: DownshiftSelectProps<T, C>,
): React.ReactElement => {
    const {
        renderSelectedItem,
        disabled,
        isLoading,
        dropdownMenuFloatingOptions,
        children,
        isItemDisabled,
        onHighlightedIndexChange,
        ...selectProps
    } = props;

    const [highlightedIndex, setHighlightedIndex] = useState<
        number | undefined
    >(undefined);

    const {
        load,
        items,
        loadingState,
        isLoading: isAsyncListLoading,
        clearItems,
        listBoxProps,
    } = useDownshiftAsyncList({...props, highlightedIndex});

    const downshiftProps = useSelect<T>(
        objectFilterUndefinedValues<UseSelectProps<T>>({
            items,
            isItemDisabled,
            onHighlightedIndexChange: (changes) => {
                setHighlightedIndex(changes.highlightedIndex);
                if(onHighlightedIndexChange) {
                    onHighlightedIndexChange(changes)
                }
            },
            ...selectProps,
        }),
    );

    const {isOpen} = downshiftProps;

    useEffect(() => {
        if (isOpen) {
            load();
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
            downshiftProps={downshiftProps}
            dropdownMenuFloatingProps={dropdownMenuFloatingProps}
            items={items}
            loadingState={loadingState}
            isLoading={isAsyncListLoading || isLoading}
            isHovered={isHovered}
            isDisabled={disabled}
            listBoxProps={listBoxProps}
            setIsHovered={setIsHovered}
            type={'select'}
            renderSelectedItem={renderSelectedItem}
            isItemDisabled={isItemDisabled}
        >
            <DownshiftSelectProvider downshiftProps={downshiftProps}>
                {children}
            </DownshiftSelectProvider>
        </BaseDownshiftContextProvider>
    );
};

export const Select = DownshiftSelect;