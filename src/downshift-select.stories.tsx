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
}

const SelectDemo = (props: DemoProps): React.ReactElement => {
    const {disabled} = props;

    return (
        <div className={'DemoRoot'}>
            <Select<DemoCity, number>
                getItems={getCities}
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
                <Listbox asChild={true}>
                    <ul className={'ComboboxListbox'}>
                        <ListBoxItems<DemoCity>
                            getOptionValue={getCityOptionValue}
                        >
                            {({values}) => (
                                <>
                                    {values.map(({rawValue}, index) => (
                                        <Option
                                            asChild={true}
                                            key={rawValue.id}
                                            rawValue={rawValue}
                                            index={index}
                                        >
                                            <li className={'ComboboxOption'}>
                                                {rawValue.name}
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
