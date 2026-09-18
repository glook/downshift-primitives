// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import {mergeProps} from '@react-aria/utils';
import React, {useMemo} from 'react';

import {useBaseDownshiftContext} from './downshiftComboboxContext';
import type {DownshiftListBoxValue} from './downshift-listbox-items';
import * as Radix from '@radix-ui/react-primitive';

export interface DownshiftOptionProps<T extends unknown>
    extends React.ComponentPropsWithoutRef<typeof Radix.Primitive.div> {
    asChild?: boolean;
    /** One entry of the `values` that ListBoxItems hands to its render prop. */
    value: DownshiftListBoxValue<T>;
}

export const DownshiftOption = <T,>(
    props: DownshiftOptionProps<T>,
): React.ReactElement | null => {
    const {downshiftProps} = useBaseDownshiftContext('DownshiftOption');
    const {getItemProps} = downshiftProps;
    const {value, children, asChild, ...rest} = props;
    const {rawValue, index, isSelected, isHighlighted} = value;

    const itemProps = getItemProps({
        item: rawValue,
        index,
    });

    const isDisabled = useMemo(
        () => itemProps['aria-disabled'] ?? false,
        [itemProps],
    );

    const Component = asChild ? Slot : 'div';

    return (
        <Component
            data-is-disabled={isDisabled}
            data-is-selected={isSelected}
            data-is-active={isHighlighted}
            {...mergeProps(rest, itemProps)}
        >
            {children}
        </Component>
    );
};

export const Option = DownshiftOption;
