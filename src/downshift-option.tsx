// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import {mergeProps} from '@react-aria/utils';
import React, {useMemo} from 'react';

import {
    useBaseDownshiftContext,
    useDownshiftListBoxContext,
} from './downshiftComboboxContext';
import * as Radix from '@radix-ui/react-primitive';

export interface DownshiftOptionProps<T extends unknown>
    extends React.ComponentPropsWithoutRef<typeof Radix.Primitive.div> {
    asChild?: boolean;
    rawValue: T;
    index: number;
}

export const DownshiftOption = <T,>(
    props: DownshiftOptionProps<T>,
): React.ReactElement | null => {
    const {downshiftProps} = useBaseDownshiftContext('DownshiftOption');
    const {getItemProps, highlightedIndex} = downshiftProps;
    const {selectedItemValue, getOptionValue} =
        useDownshiftListBoxContext('DownshiftOption');
    const {rawValue, index, children, asChild, ...rest} = props;

    const itemValue = useMemo(
        () => getOptionValue(rawValue),
        [rawValue, getOptionValue],
    );
    const isSelected = useMemo(
        () => selectedItemValue === itemValue,
        [selectedItemValue, itemValue],
    );

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
            data-is-active={highlightedIndex === index}
            {...mergeProps(rest, itemProps)}
        >
            {children}
        </Component>
    );
};

export const Option = DownshiftOption;
