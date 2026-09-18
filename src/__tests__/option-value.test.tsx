// Created by: Andrey Polyakov (andrey@polyakov.im)

import {render, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {describe, expect, test} from 'vitest';

import {Listbox} from '../downshift-listbox';
import {ListBoxItems} from '../downshift-listbox-items';
import {Option} from '../downshift-option';
import {Select} from '../downshift-select';
import {SelectedItem} from '../downshift-selected-item';
import {Trigger} from '../downshift-trigger';
import {City, CITIES, createGetItemsMock, getCityOptionValue} from './fixtures';

const renderRootValueSelect = (
    initialSelectedItem?: City,
    listGetOptionValue?: (city: City) => string,
) =>
    render(
        <Select<City, number>
            getItems={createGetItemsMock()}
            getOptionValue={getCityOptionValue}
            initialSelectedItem={initialSelectedItem}
            renderSelectedItem={(city) => <span>{city.name}</span>}
        >
            <Trigger asChild={true}>
                <button className={'ComboboxTrigger'} type={'button'}>
                    <SelectedItem className={'ComboboxSelectedItem'} />
                </button>
            </Trigger>
            <Listbox asChild={true}>
                <ul className={'ComboboxListbox'}>
                    <ListBoxItems<City> getOptionValue={listGetOptionValue}>
                        {({values}) =>
                            values.map((value) => (
                                <Option
                                    asChild={true}
                                    key={value.value}
                                    value={value}
                                >
                                    <li className={'ComboboxOption'}>
                                        {value.rawValue.name}
                                    </li>
                                </Option>
                            ))
                        }
                    </ListBoxItems>
                </ul>
            </Listbox>
        </Select>,
    );

describe('getOptionValue on the root', () => {
    test('Option takes the listbox value and reflects selection and highlight', async () => {
        const user = userEvent.setup();
        const {container} = renderRootValueSelect(CITIES[2]);
        const options = () =>
            Array.from(
                container.querySelectorAll<HTMLLIElement>('.ComboboxOption'),
            );

        await user.click(container.querySelector('.ComboboxTrigger')!);
        await waitFor(() => expect(options()).toHaveLength(5));

        expect(options()[2]).toHaveAttribute('data-is-selected', 'true');
        expect(options()[0]).toHaveAttribute('data-is-selected', 'false');

        await user.keyboard('{ArrowDown}{ArrowDown}');
        expect(options()[1]).toHaveAttribute('data-is-active', 'true');
        expect(options()[0]).toHaveAttribute('data-is-active', 'false');

        await user.click(options()[0]);
        await waitFor(() =>
            expect(
                container.querySelector('.ComboboxSelectedItem'),
            ).toHaveTextContent('London'),
        );
    });

    test('ListBoxItems.getOptionValue overrides the root for its list only', async () => {
        const user = userEvent.setup();
        // the selected item shares only its name with the list: by the root's
        // id nothing matches, by the list's name override Paris does
        const {container} = renderRootValueSelect(
            {...CITIES[1], id: 'not-in-list'},
            (city) => city.name,
        );
        const options = () =>
            Array.from(
                container.querySelectorAll<HTMLLIElement>('.ComboboxOption'),
            );

        await user.click(container.querySelector('.ComboboxTrigger')!);
        await waitFor(() => expect(options()).toHaveLength(5));
        expect(options()[1]).toHaveAttribute('data-is-selected', 'true');
        expect(options()[0]).toHaveAttribute('data-is-selected', 'false');
    });
});

// Compile-time contract: the old API is gone, not deprecated.
// @ts-expect-error - Option no longer takes rawValue/index
const optionWithOldProps = <Option rawValue={CITIES[0]} index={0} />;
const rootWithoutIdentity = (
    // @ts-expect-error - getOptionValue is required on every root
    <Select<City, number>
        getItems={createGetItemsMock()}
        renderSelectedItem={(city) => city.name}
    >
        {null}
    </Select>
);
void optionWithOldProps;
void rootWithoutIdentity;
