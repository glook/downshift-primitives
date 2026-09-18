// Created by: Andrey Polyakov (andrey@polyakov.im)

import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';

import './demo.css';
import {Arrow} from './downshift-arrow';
import {Listbox} from './downshift-listbox';
import {ListBoxItems} from './downshift-listbox-items';
import {Option} from './downshift-option';
import {OptionState} from './downshift-option-state';
import {Placeholder} from './downshift-placeholder';
import {Select} from './downshift-select';
import {SelectedItem} from './downshift-selected-item';
import {Trigger} from './downshift-trigger';
import {DemoCity, getCities, getCityOptionValue} from './demo-data';

interface DemoProps {
    disabled?: boolean;
    /** Render the listbox into document.body instead of the trigger's tree. */
    portal?: boolean;
    /** Wrap the demo in an overflow: hidden box - only a portal can escape it. */
    clipped?: boolean;
}

const SelectDemo = (props: DemoProps): React.ReactElement => {
    const {disabled, portal, clipped} = props;

    return (
        <div className={clipped ? 'DemoRoot DemoRoot--clipped' : 'DemoRoot'}>
            <Select<DemoCity, number>
                getItems={getCities}
                getOptionValue={getCityOptionValue}
                renderSelectedItem={(city) => <span>{city.name}</span>}
                disabled={disabled}
            >
                <Trigger asChild={true}>
                    <button className={'ComboboxTrigger'} type={'button'}>
                        <Placeholder className={'ComboboxPlaceholder'}>
                            Select a city
                        </Placeholder>
                        <SelectedItem className={'ComboboxSelectedItem'} />
                        <span className={'ComboboxIndicators'}>
                            <Arrow className={'ComboboxArrow'}>▾</Arrow>
                        </span>
                    </button>
                </Trigger>
                <Listbox asChild={true} portal={portal}>
                    <ul className={'ComboboxListbox'}>
                        <ListBoxItems<DemoCity>>
                            {({values}) => (
                                <>
                                    {values.map((value) => (
                                        <Option
                                            asChild={true}
                                            key={value.value}
                                            value={value}
                                        >
                                            <li className={'ComboboxOption'}>
                                                {value.rawValue.name}
                                            </li>
                                        </Option>
                                    ))}
                                    <OptionState
                                        type={'loading'}
                                        asChild={true}
                                    >
                                        <li className={'ComboboxMessage'}>
                                            Loading...
                                        </li>
                                    </OptionState>
                                </>
                            )}
                        </ListBoxItems>
                    </ul>
                </Listbox>
            </Select>
        </div>
    );
};

const meta: Meta<typeof SelectDemo> = {
    title: 'Select',
    component: SelectDemo,
};

export default meta;

type Story = StoryObj<typeof SelectDemo>;

/** Picking from a list without a text field: the list is loaded when the menu opens. */
export const Default: Story = {};

export const Disabled: Story = {
    args: {disabled: true},
};

/** The listbox lives in document.body; positioning and z-index are unchanged. */
export const Portal: Story = {
    args: {portal: true},
};

/** Same, inside an overflow: hidden box that would clip an inline listbox. */
export const PortalInClippedContainer: Story = {
    args: {portal: true, clipped: true},
};
