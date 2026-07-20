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
        hasSelectedItem,
        type,
    } = useBaseDownshiftContext('DownshiftTrigger');
    const {asChild, ...rest} = props;
    const {getToggleButtonProps, openMenu, highlightedIndex, isOpen} =
        downshiftProps;

    const containerProps = getToggleButtonProps({
        ref: mergeRefs<any>(dropdownMenuFloatingProps.refs.setReference, ref),
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        disabled: isDisabled,
        // In the combobox modes the click only opens the menu: a click on the nested
        // Input bubbles up here, and a toggle would collapse the menu it just opened
        onClick:
            type === 'select'
                ? undefined
                : (event) => {
                      preventDownshiftDefault(event);
                      openMenu();
                  },
        onKeyDown: (event) => {
            if (event.key === 'ArrowUp' && highlightedIndex === -1) {
                preventDownshiftDefault(event);
            }
        },
    });
    const Component = asChild ? Slot : type === 'select' ? 'button' : 'span';

    return (
        <Component
            {...mergeProps<any[]>(containerProps, rest)}
            data-is-disabled={isDisabled}
            data-is-hovered={isHovered}
            data-is-open={isOpen}
            data-is-loading={isLoading}
            data-has-item={hasSelectedItem ?? !!downshiftProps.selectedItem}
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
        type === 'select' ? DownshiftSelectTrigger : DownshiftComboboxTrigger;

    return <Component {...props} ref={ref} />;
});

export const Trigger = DownshiftTrigger;
