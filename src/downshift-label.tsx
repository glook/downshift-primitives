// Created by: Andrey Polyakov (andrey@polyakov.im)

import React from 'react';
import {useBaseDownshiftContext} from './downshiftComboboxContext';
import {Slot} from '@radix-ui/react-slot';

interface DownshiftLabelProps extends React.ComponentPropsWithRef<'label'> {
    asChild?: boolean;
}

export const DownshiftLabel = React.forwardRef<
    HTMLLabelElement,
    DownshiftLabelProps
>((props, ref): React.ReactElement => {
    const {downshiftProps} = useBaseDownshiftContext('DownshiftArrow');
    const {getLabelProps} = downshiftProps;
    const {asChild, ...rest} = props;
    const Component = asChild ? Slot : 'label';
    return <Component {...getLabelProps(rest)} ref={ref} />;
});
