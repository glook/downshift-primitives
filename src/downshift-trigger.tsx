// Created by: Andrey Polyakov (andrey@polyakov.im)

import {mergeProps, mergeRefs} from '@react-aria/utils';
import React from 'react';

import {
    useBaseDownshiftContext,
    useDownshiftComboboxContext,
} from './downshiftComboboxContext';
import {preventDownshiftDefault} from './utils';
import {Slot} from '@radix-ui/react-slot';

export interface DownshiftTriggerProps extends React.HTMLProps<HTMLElement> {
    asChild?: boolean;
}

const DownshiftSelectTrigger = React.forwardRef<
    HTMLElement,
    DownshiftTriggerProps
>((props, ref): React.ReactElement => {
    const {
        isDisabled,
        downshiftProps,
        setIsHovered,
        dropdownMenuFloatingProps,
        isHovered,
        isLoading,
        type,
    } = useBaseDownshiftContext('DownshiftTrigger');
    const {asChild, ...rest} = props;
    const {getToggleButtonProps, highlightedIndex, isOpen} = downshiftProps;

    const containerProps = getToggleButtonProps({
        ref: mergeRefs<any>(dropdownMenuFloatingProps.refs.setReference, ref),
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        disabled: isDisabled,
        onKeyDown: (event) => {
            if (event.key === 'ArrowUp' && highlightedIndex === -1) {
                preventDownshiftDefault(event);
            }
        },
    });
    const Component = asChild ? Slot : type === 'combobox' ? 'span' : 'button';

    return (
        <Component
            {...mergeProps<any[]>(containerProps, rest)}
            data-is-disabled={isDisabled}
            data-is-hovered={isHovered}
            data-is-open={isOpen}
            data-is-loading={isLoading}
            data-has-item={!!downshiftProps.selectedItem}
        />
    );
});

const DownshiftComboboxTrigger = React.forwardRef<
    HTMLElement,
    DownshiftTriggerProps
>((props, ref): React.ReactElement => {
    const {isFocused} = useDownshiftComboboxContext('DownshiftTrigger');
    return (
        <DownshiftSelectTrigger
            {...props}
            data-is-focused={isFocused}
            ref={ref}
        />
    );
});

export const DownshiftTrigger = React.forwardRef<
    HTMLElement,
    DownshiftTriggerProps
>((props, ref): React.ReactElement => {
    const {type} = useBaseDownshiftContext('DownshiftTrigger');
    const Component =
        type === 'combobox' ? DownshiftComboboxTrigger : DownshiftSelectTrigger;

    return <Component {...props} ref={ref} />;
});

export const Trigger = DownshiftTrigger;