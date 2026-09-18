// Created by: Andrey Polyakov (andrey@polyakov.im)

import type {Meta, StoryObj} from '@storybook/react';
import React, {useState} from 'react';

import './demo.css';
import {Chip, ChipRemove} from './downshift-chip';
import {Input} from './downshift-input';
import {Listbox} from './downshift-listbox';
import {ListBoxItems} from './downshift-listbox-items';
import {MultiCombobox} from './downshift-multi-combobox';
import {Option} from './downshift-option';
import {OptionState} from './downshift-option-state';
import {SelectedItems} from './downshift-selected-items';
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
    initialSelectedItems?: DemoCity[];
    debounceTime?: number;
}

const MultiComboboxDemo = (props: DemoProps): React.ReactElement => {
    const {
        disabled,
        initialSelectedItems = [],
        debounceTime = 300,
        portal,
        clipped,
    } = props;
    const [selectedItems, setSelectedItems] =
        useState<DemoCity[]>(initialSelectedItems);

    return (
        <div className={clipped ? 'DemoRoot DemoRoot--clipped' : 'DemoRoot'}>
            <MultiCombobox<DemoCity, number>
                selectedItems={selectedItems}
                onChange={setSelectedItems}
                getItems={getCities}
                getOptionValue={getCityOptionValue}
                itemToString={cityToString}
                renderSelectedItem={(city) => <span>{city.name}</span>}
                debounceTime={debounceTime}
                disabled={disabled}
            >
                <Trigger asChild={true}>
                    <div className={'ComboboxTrigger'}>
                        <SelectedItems<DemoCity>>
                            {({values}) =>
                                values.map(({rawValue, value, index}) => (
                                    <Chip
                                        key={value}
                                        rawValue={rawValue}
                                        index={index}
                                        className={'ComboboxChip'}
                                    >
                                        {rawValue.name}
                                        <ChipRemove
                                            className={'ComboboxChipRemove'}
                                        />
                                    </Chip>
                                ))
                            }
                        </SelectedItems>
                        <Input
                            asChild={true}
                            placeholder={'Start typing a city'}
                        >
                            <input className={'ComboboxInput'} />
                        </Input>
                    </div>
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
                                </>
                            )}
                        </ListBoxItems>
                    </ul>
                </Listbox>
            </MultiCombobox>
        </div>
    );
};

const meta: Meta<typeof MultiComboboxDemo> = {
    title: 'MultiCombobox',
    component: MultiComboboxDemo,
};

export default meta;

type Story = StoryObj<typeof MultiComboboxDemo>;

/**
 * Selected values are shown as chips and disappear from the list. After a selection
 * the menu stays open and the input is cleared - values can be picked one after another.
 */
export const Default: Story = {};

/** Backspace in an empty field activates the last chip, a second one removes it. */
export const WithSelectedItems: Story = {
    args: {
        initialSelectedItems: [
            {id: '1', name: 'London', region: 'England'},
            {id: '5', name: 'Rome', region: 'Lazio'},
        ],
    },
};

/** In the disabled state the primitive does not render the chip remove buttons. */
export const Disabled: Story = {
    args: {
        disabled: true,
        initialSelectedItems: [{id: '1', name: 'London', region: 'England'}],
    },
};

/** The listbox lives in document.body; positioning and z-index are unchanged. */
export const Portal: Story = {
    args: {portal: true},
};

/** Same, inside an overflow: hidden box that would clip an inline listbox. */
export const PortalInClippedContainer: Story = {
    args: {portal: true, clipped: true},
};
