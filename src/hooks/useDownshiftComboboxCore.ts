// Created by: Andrey Polyakov (andrey@polyakov.im)

import {
    useCombobox,
    UseComboboxProps,
    UseComboboxReturnValue,
    UseComboboxState,
    UseComboboxStateChangeOptions,
} from 'downshift';
import {useCallback, useEffect} from 'react';
import {useDebounce} from 'use-debounce';

import {
    DropdownMenuFloatingOptions,
    useDropdownMenuFloating,
} from './useDropdownMenuFloating';

/**
 * Wraps the user-supplied stateReducer and disables wrap-around arrow navigation
 * (jumping from the last item to the first one and back).
 */
export const useComboboxStateReducer = <T>(
    stateReducer?: UseComboboxProps<T>['stateReducer'],
): UseComboboxProps<T>['stateReducer'] =>
    useCallback(
        (
            state: UseComboboxState<T>,
            actionAndChanges: UseComboboxStateChangeOptions<T>,
        ): Partial<UseComboboxState<T>> => {
            const {type} = actionAndChanges;
            const changes = stateReducer
                ? stateReducer(state, actionAndChanges)
                : actionAndChanges.changes;

            switch (type) {
                case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
                    if (
                        changes.highlightedIndex !== undefined &&
                        changes.highlightedIndex < state.highlightedIndex
                    ) {
                        return {
                            ...changes,
                            highlightedIndex: state.highlightedIndex,
                        };
                    }
                    return changes;
                case useCombobox.stateChangeTypes.InputKeyDownArrowUp:
                    if (
                        changes.highlightedIndex !== undefined &&
                        changes.highlightedIndex > state.highlightedIndex
                    ) {
                        return {
                            ...changes,
                            highlightedIndex: state.highlightedIndex,
                        };
                    }
                    return changes;
                default:
                    return changes;
            }
        },
        [stateReducer],
    );

interface UseDownshiftComboboxCoreProps<T> {
    comboboxMethods: UseComboboxReturnValue<T>;
    setFilterText: (filterText: string) => void;
    clearItems: () => void;
    isInputFocused: boolean;
    debounceTime?: number;
    dropdownMenuFloatingOptions?: DropdownMenuFloatingOptions;
}

/**
 * Behaviour shared by the combobox modes: debounced filtering, open on focus,
 * clear on close, floating menu.
 */
export const useDownshiftComboboxCore = <T>(
    props: UseDownshiftComboboxCoreProps<T>,
): ReturnType<typeof useDropdownMenuFloating> => {
    const {
        comboboxMethods,
        setFilterText,
        clearItems,
        isInputFocused,
        debounceTime = 0,
        dropdownMenuFloatingOptions,
    } = props;
    const {isOpen, openMenu, inputValue} = comboboxMethods;
    const [debouncedFilter] = useDebounce(inputValue, debounceTime);

    useEffect(() => {
        setFilterText(debouncedFilter);
    }, [debouncedFilter]);

    useEffect(() => {
        if (isInputFocused) {
            openMenu();
        }
    }, [isInputFocused]);

    useEffect(() => {
        if (isOpen) {
            setFilterText(inputValue);
        } else {
            clearItems();
        }
    }, [isOpen]);

    return useDropdownMenuFloating(isOpen, dropdownMenuFloatingOptions);
};
