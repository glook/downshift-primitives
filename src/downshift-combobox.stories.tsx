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
    /** Render the listbox into document.body instead of the trigger's tree. */
    portal?: boolean;
    /** Wrap the demo in an overflow: hidden box - only a portal can escape it. */
    clipped?: boolean;
    debounceTime?: number;
    /** Shorter queries do not hit getItems; the belowMinLength state shows instead. */
    minLength?: number;
}

const ComboboxDemo = (props: DemoProps): React.ReactElement => {
    const {disabled, debounceTime = 300, portal, clipped, minLength} = props;

    return (
        <div className={clipped ? 'DemoRoot DemoRoot--clipped' : 'DemoRoot'}>
            <Combobox<DemoCity, number>
                getItems={getCities}
                getOptionValue={getCityOptionValue}
                itemToString={cityToString}
                renderSelectedItem={(city) => <span>{city.name}</span>}
                debounceTime={debounceTime}
                minLength={minLength}
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
                                    <OptionState
                                        type={'noResults'}
                                        asChild={true}
                                    >
                                        <li className={'ComboboxMessage'}>
                                            Nothing found
                                        </li>
                                    </OptionState>
                                    <OptionState
                                        type={'belowMinLength'}
                                        asChild={true}
                                    >
                                        <li className={'ComboboxMessage'}>
                                            Type at least 3 characters
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

/** Queries shorter than 3 characters never reach getItems. */
export const MinLength: Story = {
    args: {minLength: 3},
};

/** The listbox lives in document.body; positioning and z-index are unchanged. */
export const Portal: Story = {
    args: {portal: true},
};

/** Same, inside an overflow: hidden box that would clip an inline listbox. */
export const PortalInClippedContainer: Story = {
    args: {portal: true, clipped: true},
};
