// Created by: Andrey Polyakov (andrey@polyakov.im)

import {render, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {describe, expect, test, vi} from 'vitest';

import {Combobox} from '../downshift-combobox';
import {Input} from '../downshift-input';
import {Listbox} from '../downshift-listbox';
import {ListBoxItems} from '../downshift-listbox-items';
import {Option} from '../downshift-option';
import {Trigger} from '../downshift-trigger';
import {
    City,
    cityToString,
    createGetItemsMock,
    getCityOptionValue,
} from './fixtures';

describe('ref callbacks handed to Trigger and Listbox', () => {
    test('are called once with the node on mount and once with null on unmount, not on every render', async () => {
        const user = userEvent.setup();
        const triggerRef = vi.fn();
        const listboxRef = vi.fn();
        const {container, unmount} = render(
            <Combobox<City, number>
                getItems={createGetItemsMock()}
                getOptionValue={getCityOptionValue}
                itemToString={cityToString}
                renderSelectedItem={(city) => <span>{city.name}</span>}
            >
                <Trigger ref={triggerRef}>
                    <Input className={'ComboboxInput'} />
                </Trigger>
                <Listbox ref={listboxRef}>
                    <ListBoxItems<City>>
                        {({values}) =>
                            values.map((value) => (
                                <Option key={value.value} value={value}>
                                    {value.rawValue.name}
                                </Option>
                            ))
                        }
                    </ListBoxItems>
                </Listbox>
            </Combobox>,
        );

        // open, filter, close: plenty of re-renders
        await user.click(container.querySelector('.ComboboxInput')!);
        await user.type(container.querySelector('.ComboboxInput')!, 'ber');
        await waitFor(() =>
            expect(container.querySelectorAll('[role="option"]')).toHaveLength(
                1,
            ),
        );
        await user.keyboard('{Escape}');

        expect(triggerRef).toHaveBeenCalledTimes(1);
        expect(triggerRef).toHaveBeenCalledWith(expect.any(HTMLElement));
        expect(listboxRef).toHaveBeenCalledTimes(1);
        expect(listboxRef).toHaveBeenCalledWith(expect.any(HTMLElement));

        unmount();
        expect(triggerRef).toHaveBeenCalledTimes(2);
        expect(triggerRef).toHaveBeenLastCalledWith(null);
        expect(listboxRef).toHaveBeenCalledTimes(2);
        expect(listboxRef).toHaveBeenLastCalledWith(null);
    });
});
