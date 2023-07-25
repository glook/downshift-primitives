// Created by: Andrey Polyakov (andrey@polyakov.im)

import React, {useMemo} from 'react';

import {
    useBaseDownshiftContext,
    useDownshiftComboboxContext,
} from './downshiftComboboxContext';
import * as Radix from '@radix-ui/react-primitive';

export type SelectedItemElement = React.ElementRef<typeof Radix.Primitive.span>;
export interface SelectedItemProps
    extends Omit<React.ComponentPropsWithoutRef<'span'>, 'children'> {}

const SelectSelectedItem = React.forwardRef<SelectedItemElement, SelectedItemProps>(
    (props, ref): React.ReactElement | null => {
        const {downshiftProps, renderSelectedItem} =
            useBaseDownshiftContext('SelectedItem');
        const {selectedItem} = downshiftProps;
        const selectedItemElement = useMemo(
            () => (selectedItem ? renderSelectedItem(selectedItem) : null),
            [selectedItem, renderSelectedItem],
        );

        if (!downshiftProps.selectedItem) {
            return null;
        }

        return (
            <span {...props} ref={ref}>
                <span>{selectedItemElement}</span>
            </span>
        );
    },
);

const ComboboxSelectedItem = React.forwardRef<
    SelectedItemElement,
    SelectedItemProps
>((props, ref): React.ReactElement => {
    const {isFocused,downshiftProps} = useDownshiftComboboxContext('DownshiftInput');
    const {inputValue} = downshiftProps;
    return <SelectSelectedItem {...props} data-is-focused={isFocused} data-has-input-value={inputValue.length !== 0} ref={ref} />;
});

export const DownshiftSelectedItem = React.forwardRef<
    SelectedItemElement,
    SelectedItemProps
>((props, ref): React.ReactElement | null => {
    const {type} = useBaseDownshiftContext('DownshiftInput');
    const Component =
        type === 'combobox' ? ComboboxSelectedItem : SelectSelectedItem;

    return <Component {...props} data-type={type} ref={ref} />;
});

export const SelectedItem = DownshiftSelectedItem;