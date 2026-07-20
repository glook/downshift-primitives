// Created by: Andrey Polyakov (andrey@polyakov.im)

import {AsyncListData, useAsyncList} from '@react-stately/data';
import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';

import {DownshiftProps, LoadingState} from '../interface';
import {UseComboboxProps, UseSelectProps} from 'downshift';
import * as Radix from '@radix-ui/react-primitive';

interface UseDownshiftAsyncListProps<T, C>
    extends Pick<DownshiftProps<T, C>, 'getItems'> {
    isItemDisabled?:
        | UseSelectProps<T>['isItemDisabled']
        | UseComboboxProps<T>['isItemDisabled'];
    initialInputValue?: string;
    highlightedIndex?: number;
}

interface useDownShiftAsyncListReturn<T> extends AsyncListData<T> {
    load: () => void;
    clearItems: () => void;
    listBoxProps: React.ComponentPropsWithoutRef<typeof Radix.Primitive.div>;
}

export const useDownshiftAsyncList = <T, C>(
    props: UseDownshiftAsyncListProps<T, C>,
): useDownShiftAsyncListReturn<T> => {
    const {getItems, initialInputValue, highlightedIndex, isItemDisabled} =
        props;
    const [localLoadingState, setLocalLoadingState] = useState<LoadingState>();
    const [isFirstLoadCalled, setIsFirstLoadCalled] = useState<boolean>(false);
    const asyncListProps = useAsyncList<T, C>({
        load: async ({cursor = undefined, signal, filterText}) => {
            setLocalLoadingState(undefined);
            if (isFirstLoadCalled) {
                return getItems(
                    {
                        signal,
                        filterText,
                    },
                    cursor as C,
                );
            }
            // When we just render the component, we don't want to load anything
            setIsFirstLoadCalled(true);
            return {
                items: [],
            };
        },
        initialFilterText: initialInputValue,
    });

    const {
        reload,
        loadingState,
        loadMore,
        items,
        setSelectedKeys,
        removeSelectedItems,
    } = asyncListProps;

    const mergedLoadingState = localLoadingState ?? loadingState;

    const clearItems = () => {
        setLocalLoadingState('idle');
        setSelectedKeys('all');
        removeSelectedItems();
    };

    const lastNonDisabledItem = useMemo<number | undefined>(() => {
        let value = undefined;
        items.forEach((item, index) => {
            if (
                !isItemDisabled ||
                (isItemDisabled && !isItemDisabled(item, index))
            ) {
                value = index;
            }
        });

        return value;
    }, [items]);

    useEffect(() => {
        if (
            typeof highlightedIndex === 'number' &&
            typeof lastNonDisabledItem === 'number' &&
            highlightedIndex === lastNonDisabledItem
        ) {
            loadMore();
        }
    }, [highlightedIndex, lastNonDisabledItem]);

    return {
        ...asyncListProps,
        load: () => {
            clearItems();
            setLocalLoadingState(undefined);
            reload();
        },
        isLoading: ['loading', 'loadingMore', 'sorting', 'filtering'].includes(
            mergedLoadingState,
        ),
        loadingState: mergedLoadingState,
        items,
        clearItems,
        listBoxProps: {
            onScroll: ({currentTarget}) => {
                const bottomBorder =
                    currentTarget.scrollHeight -
                    currentTarget.clientHeight -
                    20;

                if (
                    bottomBorder > 0 &&
                    bottomBorder < currentTarget.scrollTop
                ) {
                    loadMore();
                }
            },
        },
    };
};
