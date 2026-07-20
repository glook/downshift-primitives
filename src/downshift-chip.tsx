// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import {mergeProps} from '@react-aria/utils';
import React from 'react';

import {
    DownshiftChipProvider,
    useBaseDownshiftContext,
    useDownshiftChipContext,
    useDownshiftMultiComboboxContext,
} from './downshiftComboboxContext';
import * as Radix from '@radix-ui/react-primitive';

// Chip is generic (rawValue: T), hence no forwardRef: React.forwardRef loses the
// generic parameter. Consumers can still reach the ref through asChild.
export interface DownshiftChipProps<T>
    extends Radix.ComponentPropsWithoutRef<typeof Radix.Primitive.span> {
    rawValue: T;
    index: number;
}

export const DownshiftChip = <T,>(
    props: DownshiftChipProps<T>,
): React.ReactElement => {
    const {isDisabled} = useBaseDownshiftContext('DownshiftChip');
    const {getSelectedItemProps, activeIndex} =
        useDownshiftMultiComboboxContext('DownshiftChip');
    const {rawValue, index, asChild, children, ...rest} = props;
    const isActive = activeIndex === index;

    const chipProps = getSelectedItemProps({selectedItem: rawValue, index});
    const Component = asChild ? Slot : 'span';

    return (
        <DownshiftChipProvider
            rawValue={rawValue}
            index={index}
            isActive={isActive}
        >
            <Component
                {...mergeProps(chipProps, rest)}
                data-is-active={isActive}
                data-is-disabled={isDisabled}
            >
                {children}
            </Component>
        </DownshiftChipProvider>
    );
};

export type DownshiftChipRemoveElement = React.ElementRef<
    typeof Radix.Primitive.span
>;

export interface DownshiftChipRemoveProps
    extends Radix.ComponentPropsWithoutRef<typeof Radix.Primitive.span> {
    forceMount?: boolean;
}

export const DownshiftChipRemove = React.forwardRef<
    DownshiftChipRemoveElement,
    DownshiftChipRemoveProps
>((props, ref): React.ReactElement | null => {
    const {isDisabled} = useBaseDownshiftContext('DownshiftChipRemove');
    const {removeSelectedItem} = useDownshiftMultiComboboxContext(
        'DownshiftChipRemove',
    );
    const {rawValue} = useDownshiftChipContext('DownshiftChipRemove');
    const {asChild, children, forceMount, style, ...rest} = props;

    if (isDisabled && !forceMount) {
        return null;
    }

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            // aria-hidden, not role=button: keyboard removal already comes from
            // useMultipleSelection, the cross is a pointer affordance
            aria-hidden={true}
            tabIndex={-1}
            style={{userSelect: 'none', ...style}}
            {...mergeProps(
                {
                    onClick: (event: React.MouseEvent<HTMLSpanElement>) => {
                        // without this the click bubbles up to Trigger and opens the menu
                        event.stopPropagation();
                        removeSelectedItem(rawValue);
                    },
                },
                rest,
            )}
            ref={ref}
        >
            {children ? children : <>×</>}
        </Component>
    );
});

export const Chip = DownshiftChip;
export const ChipRemove = DownshiftChipRemove;
