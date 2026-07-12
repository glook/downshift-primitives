// Created by: Andrey Polyakov (andrey@polyakov.im)

import React from 'react';

import {DropdownMenuFloatingOptions} from './hooks/useDropdownMenuFloating';

type MaybePromise<T> = T | Promise<T>;

export interface DownshiftProps<Item, Cursor = void> {
    getItems: DownshiftGetItemsFn<Item, Cursor>;
    isLoading?: boolean;
    disabled?: boolean;
    dropdownMenuFloatingOptions?: DropdownMenuFloatingOptions;
    children: React.ReactNode;
    renderSelectedItem: (value: Item) => React.ReactNode;
}

export type DownshiftGetItemsFn<Item, Cursor> = (
    state: DownshiftGetItemsState,
    cursor: Cursor | null,
) => MaybePromise<DownshiftGetItemsReturn<Item, Cursor>>;

export interface DownshiftGetItemsState {
    signal: AbortSignal;
    filterText?: string;
}

export interface DownshiftGetItemsReturn<Item, Cursor> {
    items: Item[];
    cursor?: Cursor;
}

export type DownshiftType = 'combobox' | 'select' | 'multi-combobox';

export type LoadingState =
    | 'loading'
    | 'sorting'
    | 'loadingMore'
    | 'error'
    | 'idle'
    | 'filtering';