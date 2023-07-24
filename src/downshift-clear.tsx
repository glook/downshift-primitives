// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import React from 'react';

import {
    useBaseDownshiftContext,
    useDownshiftComboboxContext,
} from './downshiftComboboxContext';
import {mergeProps} from '@react-aria/utils';
import * as Radix from '@radix-ui/react-primitive';

export type DownshiftClearElement = React.ElementRef<typeof Radix.Primitive.span>;

export interface DownshiftClearProps
    extends Radix.ComponentPropsWithoutRef<typeof Radix.Primitive.span> {
    forceMount?: boolean;
    showOnHover?: boolean;
}

const BaseDownshiftClear = React.forwardRef<
    DownshiftClearElement,
    DownshiftClearProps
>((props: DownshiftClearProps, ref): React.ReactElement | null => {
    const {asChild, children, forceMount, style, showOnHover, ...rest} = props;
    const {downshiftProps, isDisabled, isHovered} =
        useBaseDownshiftContext('DownshiftClear');
    if (isDisabled && !forceMount) {
        return null;
    }

    if (showOnHover && !isHovered) {
        return null;
    }

    const Component = asChild ? Slot : 'span';

    return (
        <Component
            {...mergeProps(
                {
                    onClick: (
                        e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
                    ) => {
                        e.stopPropagation();
                        downshiftProps.reset();
                    },
                },
                rest,
            )}
            role={'button'}
            tabIndex={-1}
            style={{userSelect: 'none', ...style}}
            ref={ref}
        >
            {children ? children : <>×</>}
        </Component>
    );
});

const DownshiftSelectClear = React.forwardRef<
    DownshiftClearElement,
    DownshiftClearProps
>((props: DownshiftClearProps, ref): React.ReactElement | null => {
    const {downshiftProps} = useBaseDownshiftContext('DownshiftClear');

    const showClear = !!downshiftProps.selectedItem;
    if (!showClear) {
        return null;
    }

    return <BaseDownshiftClear {...props} ref={ref} />;
});

const DownshiftComboboxClear = React.forwardRef<
    DownshiftClearElement,
    DownshiftClearProps
>((props: DownshiftClearProps, ref): React.ReactElement | null => {
    const {downshiftProps} = useDownshiftComboboxContext('DownshiftClear');
    const {inputValue, setInputValue, selectedItem} = downshiftProps;
    const showClear = !!selectedItem || inputValue.length > 0;

    if (!showClear) {
        return null;
    }

    return (
        <BaseDownshiftClear
            {...mergeProps(
                {
                    onClick: () => {
                        if (inputValue !== '' && !selectedItem) {
                            setInputValue('');
                        }
                    },
                },
                props,
            )}
            ref={ref}
        />
    );
});

export const DownshiftClear = React.forwardRef<
    DownshiftClearElement,
    DownshiftClearProps
>((props: DownshiftClearProps, ref): React.ReactElement | null => {
    const {type} = useBaseDownshiftContext('DownshiftClear');
    const Component =
        type === 'combobox' ? DownshiftComboboxClear : DownshiftSelectClear;
    return <Component {...props} ref={ref} />;
});
