// Created by: Andrey Polyakov (andrey@polyakov.im)

import {Slot} from '@radix-ui/react-slot';
import {mergeProps, mergeRefs} from '@react-aria/utils';
import React, {useEffect} from 'react';
import {createPortal} from 'react-dom';

import {useBaseDownshiftContext} from './downshiftComboboxContext';
import {useIsDownshiftLoading} from './hooks/useIsDownshiftLoading';
import {useStableRefCallback} from './hooks/useStableRefCallback';
import * as Radix from '@radix-ui/react-primitive';

export type DownshiftListboxElement = HTMLDivElement;
export type DownshiftListboxProps = React.ComponentPropsWithoutRef<
    typeof Radix.Primitive.div
> & {
    /**
     * Renders the listbox into `document.body` (`true`) or into the given
     * element. The container must exist on the first render - the caller owns
     * that guarantee. Client-only: on the server the listbox renders nothing.
     */
    portal?: boolean | Element;
};

export const DownshiftListbox = React.forwardRef<
    DownshiftListboxElement,
    DownshiftListboxProps
>((props: DownshiftListboxProps, ref): React.ReactElement | null => {
    const isLoading = useIsDownshiftLoading();
    const {
        loadingState,
        listBoxProps,
        dropdownMenuFloatingProps,
        downshiftProps,
        items,
    } = useBaseDownshiftContext('DownshiftListBox');
    const {getMenuProps, isOpen, inputValue} = downshiftProps;
    const {strategy, x, y} = dropdownMenuFloatingProps;
    const {children, style, asChild, portal, ...rest} = props;
    const Component = asChild ? Slot : 'div';
    const listboxRef = React.useRef<DownshiftListboxElement>(null);

    const menuProps = getMenuProps<DownshiftListboxProps>({
        style: {
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            ...style,
        },
        ...mergeProps(rest, listBoxProps),
    });

    // downshift's own ref comes back inside menuProps; React gets one stable
    // callback that fans out to it, floating-ui and the consumer's ref
    const stableRef = useStableRefCallback<DownshiftListboxElement>(
        mergeRefs(
            menuProps.ref as React.Ref<DownshiftListboxElement>,
            dropdownMenuFloatingProps.refs.setFloating,
            ref,
            listboxRef,
        ) as React.Ref<DownshiftListboxElement>,
    );

    useEffect(() => {
        if (listboxRef.current) {
            listboxRef.current.scrollTop = 0;
        }
    }, [inputValue]);

    const listbox = (
        <Component
            {...menuProps}
            ref={stableRef}
            data-is-open={isOpen}
            data-has-error={isOpen && loadingState === 'error'}
            data-is-loading={isOpen && isLoading}
            data-loading-state={loadingState}
            data-has-no-items={isOpen && !items.length}
        >
            {children}
        </Component>
    );

    if (!portal) {
        return listbox;
    }
    if (typeof document === 'undefined') {
        return null;
    }
    return createPortal(listbox, portal === true ? document.body : portal);
});

export const Listbox = DownshiftListbox;
