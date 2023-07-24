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

const SelectedItem = React.forwardRef<SelectedItemElement, SelectedItemProps>(
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

const DownshiftComboboxSelectedItem = React.forwardRef<
    SelectedItemElement,
    SelectedItemProps
>((props, ref): React.ReactElement => {
    const {isFocused} = useDownshiftComboboxContext('DownshiftInput');
    return <SelectedItem {...props} data-is-focused={isFocused} ref={ref} />;
});

export const DownshiftSelectedItem = React.forwardRef<
    SelectedItemElement,
    SelectedItemProps
>((props, ref): React.ReactElement | null => {
    const {type} = useBaseDownshiftContext('DownshiftInput');
    const Component =
        type === 'combobox' ? DownshiftComboboxSelectedItem : SelectedItem;

    return <Component {...props} data-type={type} ref={ref} />;
});
