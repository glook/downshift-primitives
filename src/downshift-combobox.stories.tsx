// Created by: Andrey Polyakov (andrey@polyakov.im)

import type {Meta, StoryObj} from '@storybook/react';
import React from 'react';

import './demo.css';
import {Arrow} from './downshift-arrow';
import {Clear} from './downshift-clear';
import {Combobox} from './downshift-combobox';
import {Input} from './downshift-input';
import {Listbox} from './downshift-listbox';
import {ListBoxItems} from './downshift-listbox-items';
import {LoadingIndicator} from './downshift-loading-indicator';
import {Option} from './downshift-option';
import {OptionState} from './downshift-option-state';
import {SelectedItem} from './downshift-selected-item';
import {Trigger} from './downshift-trigger';
import {
    cityToString,
    DemoCity,
    getCities,
    getCityOptionValue,
} from './demo-data';

interface DemoProps {
    disabled?: boolean;
    debounceTime?: number;
}

const ComboboxDemo = (props: DemoProps): React.ReactElement => {
    const {disabled, debounceTime = 300} = props;

    return (
        <div className={'DemoRoot'}>
            <Combobox<DemoCity, number>
                getItems={getCities}
                itemToString={cityToString}
                renderSelectedItem={(city) => <span>{city.name}</span>}
                debounceTime={debounceTime}
                disabled={disabled}
            >
                <Trigger asChild={true}>
                    <span className={'ComboboxTrigger'}>
                        <span style={{flex: 1, position: 'relative'}}>
                            <Input
                                asChild={true}
                                placeholder={'Start typing a city'}
                            >
                                <input className={'ComboboxInput'} />
                            </Input>
                            <SelectedItem className={'ComboboxSelectedItem'} />
                        </span>
                        <span className={'ComboboxIndicators'}>
                            <LoadingIndicator>…</LoadingIndicator>
                            <Clear className={'ComboboxClear'} />
                            <Arrow className={'ComboboxArrow'}>▾</Arrow>
                        </span>
                    </span>
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
                                    <OptionState
                                        type={'noResults'}
                                        asChild={true}
                                    >
                                        <li className={'ComboboxMessage'}>
                                            Nothing found
                                        </li>
                                    </OptionState>
                                </>
                            )}
                        </ListBoxItems>
                    </ul>
                </Listbox>
            </Combobox>
        </div>
    );
};

const meta: Meta<typeof ComboboxDemo> = {
    title: 'Combobox',
    component: ComboboxDemo,
};

export default meta;

type Story = StoryObj<typeof ComboboxDemo>;

/**
 * Single selection with async loading: typing filters the list (debounced),
 * scrolling to the bottom loads the next page by cursor.
 */
export const Default: Story = {};

export const Disabled: Story = {
    args: {disabled: true},
};
