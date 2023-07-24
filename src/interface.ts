// Created by: Andrey Polyakov (andrey@polyakov.im)

import type {AsyncListLoadOptions} from '@react-stately/data';
import React from 'react';

import {DropdownMenuFloatingOptions} from './hooks/useDropdownMenuFloating';

type MaybePromise<T> = T | Promise<T>;

export interface DownshiftAsyncListLoadReturn<Item, Cursor> {
    items: Item[];
    cursor?: Cursor;
}

export type DownshiftAsyncListLoadState<Item> = Pick<
    AsyncListLoadOptions<Item, unknown>,
    'items' | 'filterText' | 'signal'
>;

export interface DownshiftProps<Item, Cursor> {
    getItems: DownshiftGetItemsFn<Item, Cursor>;
    isLoading?: boolean;
    disabled?: boolean;
    dropdownMenuFloatingOptions?: DropdownMenuFloatingOptions;
    children: React.ReactNode;
    renderSelectedItem: (value: Item) => React.ReactNode;
}

export type DownshiftGetItemsFn<Item, Cursor = undefined> = (
    state: DownshiftAsyncListLoadState<Item>,
    cursor: Cursor,
) => MaybePromise<DownshiftAsyncListLoadReturn<Item, Cursor>>;

export type LoadingState =
    | 'loading'
    | 'sorting'
    | 'loadingMore'
    | 'error'
    | 'idle'
    | 'filtering';