// Created by: Andrey Polyakov (andrey@polyakov.im)

import {createContext} from '@radix-ui/react-context';
import {
    UseComboboxProps,
    UseComboboxReturnValue,
    UseSelectProps,
    UseSelectReturnValue,
} from 'downshift';
import React from 'react';
import {useDropdownMenuFloating} from './hooks/useDropdownMenuFloating.ts';
import {LoadingState} from './interface.ts';
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
    type: 'combobox' | 'select';
    renderSelectedItem: (value: any) => React.ReactNode;
    isItemDisabled?:
        | UseSelectProps<any>['isItemDisabled']
        | UseComboboxProps<any>['isItemDisabled'];
}

interface DownshiftComboboxContext {
    isFocused?: boolean;
    setIsFocused: (value: boolean) => void;
    downshiftProps: UseComboboxReturnValue<any>;
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

export const [DownshiftSelectProvider, useDownshiftSelectContext] =
    createContext<DownshiftSelectContext>('DownshiftSelectContext');

export const [DownshiftListBoxProvider, useDownshiftListBoxContext] =
    createContext<DownshiftListBoxContext>('DownshiftListBoxContext');
