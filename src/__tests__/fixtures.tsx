// Created by: Andrey Polyakov (andrey@polyakov.im)

import '@testing-library/jest-dom/vitest';
import {render, RenderResult} from '@testing-library/react';
import React, {useState} from 'react';
import {vi} from 'vitest';

import {Arrow} from '../downshift-arrow';
import {Chip, ChipRemove} from '../downshift-chip';
import {Clear} from '../downshift-clear';
import {Combobox, DownshiftComboboxProps} from '../downshift-combobox';
import {Input} from '../downshift-input';
import {Listbox} from '../downshift-listbox';
import {ListBoxItems} from '../downshift-listbox-items';
import {LoadingIndicator} from '../downshift-loading-indicator';
import {
    DownshiftMultiComboboxProps,
    MultiCombobox,
} from '../downshift-multi-combobox';
import {Option} from '../downshift-option';
import {OptionState} from '../downshift-option-state';
import {Placeholder} from '../downshift-placeholder';
import {DownshiftSelectProps, Select} from '../downshift-select';
import {SelectedItem} from '../downshift-selected-item';
import {SelectedItems} from '../downshift-selected-items';
import {Trigger} from '../downshift-trigger';
import type {DownshiftGetItemsFn, DownshiftGetItemsReturn} from '../interface';

export interface City {
    id: string;
    name: string;
    region: string;
}

export const CITIES: City[] = [
    {id: '1', name: 'London', region: 'England'},
    {id: '2', name: 'Paris', region: 'Île-de-France'},
    {id: '3', name: 'Berlin', region: 'Brandenburg'},
    {id: '4', name: 'Madrid', region: 'Community of Madrid'},
    {id: '5', name: 'Rome', region: 'Lazio'},
];

export const cityToString = (city: City | null): string =>
    city ? city.name : '';
export const getCityOptionValue = (city: City): string => city.id;

type CityGetItems = DownshiftGetItemsFn<City, number>;

/**
 * Filters the fixture in-memory instead of demo-data.ts: keeps combobox tests
 * independent from the storybook demo (which also adds an artificial delay).
 */
export const createGetItemsMock = (items: City[] = CITIES): CityGetItems =>
    vi.fn(async ({filterText}) => {
        const query = (filterText ?? '').trim().toLowerCase();
        const filtered = query
            ? items.filter((city) => city.name.toLowerCase().includes(query))
            : items;
        return {items: filtered};
    }) as unknown as CityGetItems;

export interface DeferredGetItems<T, C> {
    getItems: DownshiftGetItemsFn<T, C>;
    resolveNext: (value: DownshiftGetItemsReturn<T, C>) => void;
    rejectNext: (error: unknown) => void;
    pendingCount: () => number;
}

/**
 * getItems() that never resolves on its own: resolveNext/rejectNext settle the
 * oldest outstanding call, so tests can assert on the intermediate loading state.
 */
export const createDeferredGetItems = <T, C = void>(): DeferredGetItems<
    T,
    C
> => {
    const pending: Array<{
        resolve: (value: DownshiftGetItemsReturn<T, C>) => void;
        reject: (error: unknown) => void;
    }> = [];

    const getItems = vi.fn(
        () =>
            new Promise<DownshiftGetItemsReturn<T, C>>((resolve, reject) => {
                pending.push({resolve, reject});
            }),
    ) as unknown as DownshiftGetItemsFn<T, C>;

    return {
        getItems,
        resolveNext: (value) => {
            const next = pending.shift();
            if (!next) {
                throw new Error(
                    'createDeferredGetItems: no pending call to resolve',
                );
            }
            next.resolve(value);
        },
        rejectNext: (error) => {
            const next = pending.shift();
            if (!next) {
                throw new Error(
                    'createDeferredGetItems: no pending call to reject',
                );
            }
            next.reject(error);
        },
        pendingCount: () => pending.length,
    };
};

const qs = <T extends Element = HTMLElement>(
    container: HTMLElement,
    selector: string,
): T | null => container.querySelector<T>(selector);

const qsAll = <T extends Element = HTMLElement>(
    container: HTMLElement,
    selector: string,
): T[] => Array.from(container.querySelectorAll<T>(selector));

export type MessageType = 'loading' | 'noResults' | 'error';

export interface ComboboxHarness extends RenderResult {
    getItemsMock: CityGetItems;
    getInput: () => HTMLInputElement;
    getTrigger: () => HTMLElement;
    getListbox: () => HTMLElement;
    getArrow: () => HTMLElement;
    getClear: () => HTMLElement | null;
    getSelectedItem: () => HTMLElement | null;
    getOptions: () => HTMLLIElement[];
    getMessage: (type: MessageType) => HTMLElement | null;
    /** Branch-dispatcher probe: Placeholder must return null inside a combobox tree. */
    getPlaceholderProbe: () => HTMLElement | null;
}

export type RenderComboboxOptions = Partial<
    Omit<DownshiftComboboxProps<City, number>, 'children'>
>;

const comboboxChildren = (
    <>
        <Trigger asChild={true}>
            <span className={'ComboboxTrigger'}>
                <span style={{flex: 1, position: 'relative'}}>
                    <Input asChild={true} placeholder={'Start typing a city'}>
                        <input className={'ComboboxInput'} />
                    </Input>
                    <SelectedItem className={'ComboboxSelectedItem'} />
                </span>
                <span className={'ComboboxIndicators'}>
                    <LoadingIndicator>…</LoadingIndicator>
                    <Clear className={'ComboboxClear'} />
                    <Arrow className={'ComboboxArrow'}>▾</Arrow>
                </span>
                <Placeholder className={'BranchProbePlaceholder'}>
                    placeholder must not render in a combobox
                </Placeholder>
            </span>
        </Trigger>
        <Listbox asChild={true}>
            <ul className={'ComboboxListbox'}>
                <ListBoxItems<City> getOptionValue={getCityOptionValue}>
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
                            <OptionState type={'loading'} asChild={true}>
                                <li
                                    className={
                                        'ComboboxMessage ComboboxMessage--loading'
                                    }
                                >
                                    Loading...
                                </li>
                            </OptionState>
                            <OptionState type={'noResults'} asChild={true}>
                                <li
                                    className={
                                        'ComboboxMessage ComboboxMessage--noResults'
                                    }
                                >
                                    Nothing found
                                </li>
                            </OptionState>
                            <OptionState type={'error'} asChild={true}>
                                <li
                                    className={
                                        'ComboboxMessage ComboboxMessage--error'
                                    }
                                >
                                    Error
                                </li>
                            </OptionState>
                        </>
                    )}
                </ListBoxItems>
            </ul>
        </Listbox>
    </>
);

export const renderCombobox = (
    options: RenderComboboxOptions = {},
): ComboboxHarness => {
    const {
        getItems = createGetItemsMock(),
        itemToString = cityToString,
        renderSelectedItem = (city: City) => <span>{city.name}</span>,
        ...rest
    } = options;

    const utils = render(
        <Combobox<City, number>
            getItems={getItems}
            itemToString={itemToString}
            renderSelectedItem={renderSelectedItem}
            {...rest}
        >
            {comboboxChildren}
        </Combobox>,
    );

    const {container} = utils;

    return {
        ...utils,
        getItemsMock: getItems,
        getInput: () => qs<HTMLInputElement>(container, '.ComboboxInput')!,
        getTrigger: () => qs(container, '.ComboboxTrigger')!,
        getListbox: () => qs(container, '.ComboboxListbox')!,
        getArrow: () => qs(container, '.ComboboxArrow')!,
        getClear: () => qs(container, '.ComboboxClear'),
        getSelectedItem: () => qs(container, '.ComboboxSelectedItem'),
        getOptions: () => qsAll<HTMLLIElement>(container, '.ComboboxOption'),
        getMessage: (type) => qs(container, `.ComboboxMessage--${type}`),
        getPlaceholderProbe: () => qs(container, '.BranchProbePlaceholder'),
    };
};

export interface SelectHarness extends RenderResult {
    getItemsMock: CityGetItems;
    getTrigger: () => HTMLElement;
    getListbox: () => HTMLElement;
    getPlaceholder: () => HTMLElement | null;
    getSelectedItem: () => HTMLElement | null;
    getOptions: () => HTMLLIElement[];
    /** Branch-dispatcher probe: Input must return null inside a select tree. */
    getInputProbe: () => HTMLElement | null;
}

export type RenderSelectOptions = Partial<
    Omit<DownshiftSelectProps<City, number>, 'children'>
>;

export const renderSelect = (
    options: RenderSelectOptions = {},
): SelectHarness => {
    const {
        getItems = createGetItemsMock(),
        renderSelectedItem = (city: City) => <span>{city.name}</span>,
        ...rest
    } = options;

    const utils = render(
        <Select<City, number>
            getItems={getItems}
            renderSelectedItem={renderSelectedItem}
            {...rest}
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
                    <Input className={'BranchProbeInput'} />
                </button>
            </Trigger>
            <Listbox asChild={true}>
                <ul className={'ComboboxListbox'}>
                    <ListBoxItems<City> getOptionValue={getCityOptionValue}>
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
                                <OptionState type={'loading'} asChild={true}>
                                    <li className={'ComboboxMessage'}>
                                        Loading...
                                    </li>
                                </OptionState>
                            </>
                        )}
                    </ListBoxItems>
                </ul>
            </Listbox>
        </Select>,
    );

    const {container} = utils;

    return {
        ...utils,
        getItemsMock: getItems,
        getTrigger: () => qs(container, '.ComboboxTrigger')!,
        getListbox: () => qs(container, '.ComboboxListbox')!,
        getPlaceholder: () => qs(container, '.ComboboxPlaceholder'),
        getSelectedItem: () => qs(container, '.ComboboxSelectedItem'),
        getOptions: () => qsAll<HTMLLIElement>(container, '.ComboboxOption'),
        getInputProbe: () => qs(container, '.BranchProbeInput'),
    };
};

export interface MultiComboboxHarness extends RenderResult {
    getItemsMock: CityGetItems;
    onChange: ReturnType<typeof vi.fn>;
    getInput: () => HTMLInputElement;
    getTrigger: () => HTMLElement;
    getListbox: () => HTMLElement;
    getOptions: () => HTMLLIElement[];
    getChips: () => HTMLElement[];
}

export type RenderMultiComboboxOptions = Partial<
    Omit<
        DownshiftMultiComboboxProps<City, number>,
        'children' | 'selectedItems' | 'onChange'
    >
> & {
    initialSelectedItems?: City[];
};

export const renderMultiCombobox = (
    options: RenderMultiComboboxOptions = {},
): MultiComboboxHarness => {
    const {
        getItems = createGetItemsMock(),
        getOptionValue = getCityOptionValue,
        itemToString = cityToString,
        renderSelectedItem = (city: City) => <span>{city.name}</span>,
        initialSelectedItems = [],
        ...rest
    } = options;

    const onChange = vi.fn();

    const Wrapper = (): React.ReactElement => {
        const [selectedItems, setSelectedItems] =
            useState<City[]>(initialSelectedItems);

        return (
            <MultiCombobox<City, number>
                selectedItems={selectedItems}
                onChange={(items) => {
                    onChange(items);
                    setSelectedItems(items);
                }}
                getItems={getItems}
                getOptionValue={getOptionValue}
                itemToString={itemToString}
                renderSelectedItem={renderSelectedItem}
                {...rest}
            >
                <Trigger asChild={true}>
                    <div className={'ComboboxTrigger'}>
                        <SelectedItems<City>>
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
                <Listbox asChild={true}>
                    <ul className={'ComboboxListbox'}>
                        <ListBoxItems<City> getOptionValue={getCityOptionValue}>
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
            </MultiCombobox>
        );
    };

    const utils = render(<Wrapper />);
    const {container} = utils;

    return {
        ...utils,
        getItemsMock: getItems,
        onChange,
        getInput: () => qs<HTMLInputElement>(container, '.ComboboxInput')!,
        getTrigger: () => qs(container, '.ComboboxTrigger')!,
        getListbox: () => qs(container, '.ComboboxListbox')!,
        getOptions: () => qsAll<HTMLLIElement>(container, '.ComboboxOption'),
        getChips: () => qsAll(container, '.ComboboxChip'),
    };
};
