// Created by: Andrey Polyakov (andrey@polyakov.im)

import {createContext} from '@radix-ui/react-context';
import {
    UseComboboxProps,
    UseComboboxReturnValue,
    UseMultipleSelectionReturnValue,
    UseSelectProps,
    UseSelectReturnValue,
} from 'downshift';
import React from 'react';
import {useDropdownMenuFloating} from './hooks/useDropdownMenuFloating';
import {DownshiftType, LoadingState} from './interface';
import * as Radix from '@radix-ui/react-primitive';

interface DownshiftContext {
    listBoxProps: Radix.ComponentPropsWithoutRef<typeof Radix.Primitive.div>;
    items: unknown[];
    loadingState: LoadingState;
    isLoading?: boolean;
    isDisabled?: boolean;
    isHovered?: boolean;
    setIsHovered: (value: boolean) => void;
    dropdownMenuFloatingProps: ReturnType<typeof useDropdownMenuFloating>;
    downshiftProps: UseComboboxReturnValue<any> | UseSelectReturnValue<any>;
    type: DownshiftType;
    renderSelectedItem: (value: any) => React.ReactNode;
    isItemDisabled?:
        | UseSelectProps<any>['isItemDisabled']
        | UseComboboxProps<any>['isItemDisabled'];
    // whether a value is selected: in multi-combobox that means a non-empty chip list
    hasSelectedItem?: boolean;
}

interface DownshiftComboboxContext {
    isFocused?: boolean;
    setIsFocused: (value: boolean) => void;
    downshiftProps: UseComboboxReturnValue<any>;
}

interface DownshiftMultiComboboxContext {
    selectedItems: any[];
    activeIndex: number;
    // required in multi-combobox: items are compared by it. In the other modes
    // getOptionValue comes as a ListBoxItems prop rather than through context
    getOptionValue: (value: any) => string;
    getSelectedItemProps: UseMultipleSelectionReturnValue<any>['getSelectedItemProps'];
    getDropdownProps: UseMultipleSelectionReturnValue<any>['getDropdownProps'];
    removeSelectedItem: UseMultipleSelectionReturnValue<any>['removeSelectedItem'];
    // removeSelectedItem drops one item at a time; Clear needs to replace the
    // whole list at once, which only the consumer's onChange can do
    onChange: (items: any[]) => void;
}

interface DownshiftChipContext {
    rawValue: unknown;
    index: number;
    isActive: boolean;
}

interface DownshiftSelectContext {
    downshiftProps: UseSelectReturnValue<any>;
}

interface DownshiftListBoxContext {
    getOptionValue: (value: any) => string;
    selectedItemValue: string | undefined;
}

export const [BaseDownshiftContextProvider, useBaseDownshiftContext] =
    createContext<DownshiftContext>('BaseDownshiftContext');

export const [DownshiftComboboxProvider, useDownshiftComboboxContext] =
    createContext<DownshiftComboboxContext>('DownshiftComboboxContext');

export const [
    DownshiftMultiComboboxProvider,
    useDownshiftMultiComboboxContext,
] = createContext<DownshiftMultiComboboxContext>(
    'DownshiftMultiComboboxContext',
);

export const [DownshiftChipProvider, useDownshiftChipContext] =
    createContext<DownshiftChipContext>('DownshiftChipContext');

export const [DownshiftSelectProvider, useDownshiftSelectContext] =
    createContext<DownshiftSelectContext>('DownshiftSelectContext');

export const [DownshiftListBoxProvider, useDownshiftListBoxContext] =
    createContext<DownshiftListBoxContext>('DownshiftListBoxContext');
