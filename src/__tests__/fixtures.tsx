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
import {Label} from '../downshift-label';
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

/** Paginated getItems: each page has `pageSize` items, cursor advances until exhausted. */
export const createPaginatedGetItemsMock = (
    items: City[] = CITIES,
    pageSize = 2,
): CityGetItems =>
    vi.fn(async ({filterText}, cursor) => {
        const page = (cursor as number | null) ?? 0;
        const query = (filterText ?? '').trim().toLowerCase();
        const filtered = query
            ? items.filter((city) => city.name.toLowerCase().includes(query))
            : items;
        const pageItems = filtered.slice(
            page * pageSize,
            (page + 1) * pageSize,
        );
        return {
            items: pageItems,
            cursor:
                (page + 1) * pageSize < filtered.length ? page + 1 : undefined,
        };
    }) as unknown as CityGetItems;

/** Flushes pending microtasks (e.g. the swallowed first `useAsyncList` load). */
export const flush = (): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, 0));

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

export const MESSAGE_TYPES = [
    'loading',
    'loadingMore',
    'noResults',
    'error',
] as const;

export type MessageType = (typeof MESSAGE_TYPES)[number];

const dataAttrs = (element: Element | null): Record<string, string> | null => {
    if (!element) {
        return null;
    }
    const entries = Array.from(element.attributes)
        .filter((attr) => attr.name.startsWith('data-'))
        .map((attr): [string, string] => [attr.name, attr.value])
        .sort(([left], [right]) => left.localeCompare(right));

    return Object.fromEntries(entries);
};

export type DataAttrsSnapshot = Record<string, Record<string, string> | null>;

/**
 * Collects only the `data-*` attributes of the named parts: downshift emits
 * `aria-*`/`id`, Radix emits nothing, so the prefix filter isolates the public
 * styling contract from generated noise.
 */
const collectDataAttrs = (
    parts: Record<string, () => Element | null>,
): DataAttrsSnapshot =>
    Object.fromEntries(
        Object.entries(parts).map(([name, get]) => [name, dataAttrs(get())]),
    );

/** Shared by all three roots so every one of them exposes the same option states. */
const listboxChildren = (
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
                        {MESSAGE_TYPES.map((type) => (
                            <OptionState key={type} type={type} asChild={true}>
                                <li
                                    className={`ComboboxMessage ComboboxMessage--${type}`}
                                >
                                    {type}
                                </li>
                            </OptionState>
                        ))}
                    </>
                )}
            </ListBoxItems>
        </ul>
    </Listbox>
);

export interface ComboboxHarness extends RenderResult {
    getItemsMock: CityGetItems;
    getInput: () => HTMLInputElement;
    getTrigger: () => HTMLElement;
    getListbox: () => HTMLElement;
    getArrow: () => HTMLElement;
    getClear: () => HTMLElement | null;
    getLabel: () => HTMLElement | null;
    getLoadingIndicator: () => HTMLElement | null;
    getSelectedItem: () => HTMLElement | null;
    getOptions: () => HTMLLIElement[];
    getMessage: (type: MessageType) => HTMLElement | null;
    /** Branch-dispatcher probe: Placeholder must return null inside a combobox tree. */
    getPlaceholderProbe: () => HTMLElement | null;
    snapshotAttrs: () => DataAttrsSnapshot;
}

export type RenderComboboxOptions = Partial<
    Omit<DownshiftComboboxProps<City, number>, 'children'>
>;

const comboboxChildren = (
    <>
        <Label className={'ComboboxLabel'}>City</Label>
        <Trigger asChild={true}>
            <span className={'ComboboxTrigger'}>
                <span style={{flex: 1, position: 'relative'}}>
                    <Input asChild={true} placeholder={'Start typing a city'}>
                        <input className={'ComboboxInput'} />
                    </Input>
                    <SelectedItem className={'ComboboxSelectedItem'} />
                </span>
                <span className={'ComboboxIndicators'}>
                    <LoadingIndicator className={'ComboboxLoadingIndicator'}>
                        …
                    </LoadingIndicator>
                    <Clear className={'ComboboxClear'} />
                    <Arrow className={'ComboboxArrow'}>▾</Arrow>
                </span>
                <Placeholder className={'BranchProbePlaceholder'}>
                    placeholder must not render in a combobox
                </Placeholder>
            </span>
        </Trigger>
        {listboxChildren}
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

    const parts = {
        label: () => qs(container, '.ComboboxLabel'),
        trigger: () => qs(container, '.ComboboxTrigger'),
        input: () => qs(container, '.ComboboxInput'),
        selectedItem: () => qs(container, '.ComboboxSelectedItem'),
        loadingIndicator: () => qs(container, '.ComboboxLoadingIndicator'),
        clear: () => qs(container, '.ComboboxClear'),
        arrow: () => qs(container, '.ComboboxArrow'),
        listbox: () => qs(container, '.ComboboxListbox'),
        firstOption: () => qs(container, '.ComboboxOption'),
    };

    return {
        ...utils,
        getItemsMock: getItems,
        getInput: () => qs<HTMLInputElement>(container, '.ComboboxInput')!,
        getTrigger: () => qs(container, '.ComboboxTrigger')!,
        getListbox: () => qs(container, '.ComboboxListbox')!,
        getArrow: () => qs(container, '.ComboboxArrow')!,
        getClear: () => qs(container, '.ComboboxClear'),
        getLabel: () => qs(container, '.ComboboxLabel'),
        getLoadingIndicator: () => qs(container, '.ComboboxLoadingIndicator'),
        getSelectedItem: () => qs(container, '.ComboboxSelectedItem'),
        getOptions: () => qsAll<HTMLLIElement>(container, '.ComboboxOption'),
        getMessage: (type) => qs(container, `.ComboboxMessage--${type}`),
        getPlaceholderProbe: () => qs(container, '.BranchProbePlaceholder'),
        snapshotAttrs: () => collectDataAttrs(parts),
    };
};

export interface SelectHarness extends RenderResult {
    getItemsMock: CityGetItems;
    getTrigger: () => HTMLElement;
    getListbox: () => HTMLElement;
    getPlaceholder: () => HTMLElement | null;
    getSelectedItem: () => HTMLElement | null;
    getOptions: () => HTMLLIElement[];
    getClear: () => HTMLElement | null;
    getLabel: () => HTMLElement | null;
    getLoadingIndicator: () => HTMLElement | null;
    getMessage: (type: MessageType) => HTMLElement | null;
    /** Branch-dispatcher probe: Input must return null inside a select tree. */
    getInputProbe: () => HTMLElement | null;
    snapshotAttrs: () => DataAttrsSnapshot;
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
            <Label className={'ComboboxLabel'}>City</Label>
            <Trigger asChild={true}>
                <button className={'ComboboxTrigger'} type={'button'}>
                    <Placeholder className={'ComboboxPlaceholder'}>
                        Select a city
                    </Placeholder>
                    <SelectedItem className={'ComboboxSelectedItem'} />
                    <span className={'ComboboxIndicators'}>
                        <LoadingIndicator
                            className={'ComboboxLoadingIndicator'}
                        >
                            …
                        </LoadingIndicator>
                        <Clear className={'ComboboxClear'} />
                        <Arrow className={'ComboboxArrow'}>▾</Arrow>
                    </span>
                    <Input className={'BranchProbeInput'} />
                </button>
            </Trigger>
            {listboxChildren}
        </Select>,
    );

    const {container} = utils;

    const parts = {
        label: () => qs(container, '.ComboboxLabel'),
        trigger: () => qs(container, '.ComboboxTrigger'),
        placeholder: () => qs(container, '.ComboboxPlaceholder'),
        selectedItem: () => qs(container, '.ComboboxSelectedItem'),
        loadingIndicator: () => qs(container, '.ComboboxLoadingIndicator'),
        clear: () => qs(container, '.ComboboxClear'),
        arrow: () => qs(container, '.ComboboxArrow'),
        listbox: () => qs(container, '.ComboboxListbox'),
        firstOption: () => qs(container, '.ComboboxOption'),
    };

    return {
        ...utils,
        getItemsMock: getItems,
        getTrigger: () => qs(container, '.ComboboxTrigger')!,
        getListbox: () => qs(container, '.ComboboxListbox')!,
        getPlaceholder: () => qs(container, '.ComboboxPlaceholder'),
        getSelectedItem: () => qs(container, '.ComboboxSelectedItem'),
        getOptions: () => qsAll<HTMLLIElement>(container, '.ComboboxOption'),
        getClear: () => qs(container, '.ComboboxClear'),
        getLabel: () => qs(container, '.ComboboxLabel'),
        getLoadingIndicator: () => qs(container, '.ComboboxLoadingIndicator'),
        getMessage: (type) => qs(container, `.ComboboxMessage--${type}`),
        getInputProbe: () => qs(container, '.BranchProbeInput'),
        snapshotAttrs: () => collectDataAttrs(parts),
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
    getChipRemoves: () => HTMLElement[];
    getClear: () => HTMLElement | null;
    getLabel: () => HTMLElement | null;
    getLoadingIndicator: () => HTMLElement | null;
    /** Branch-dispatcher probe: SelectedItem must return null in a multi-combobox. */
    getSelectedItemProbe: () => HTMLElement | null;
    getMessage: (type: MessageType) => HTMLElement | null;
    snapshotAttrs: () => DataAttrsSnapshot;
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
                <Label className={'ComboboxLabel'}>City</Label>
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
                        <span className={'ComboboxIndicators'}>
                            <LoadingIndicator
                                className={'ComboboxLoadingIndicator'}
                            >
                                …
                            </LoadingIndicator>
                            <Clear className={'ComboboxClear'} />
                            <Arrow className={'ComboboxArrow'}>▾</Arrow>
                        </span>
                        <SelectedItem className={'BranchProbeSelectedItem'} />
                    </div>
                </Trigger>
                {listboxChildren}
            </MultiCombobox>
        );
    };

    const utils = render(<Wrapper />);
    const {container} = utils;

    const parts = {
        label: () => qs(container, '.ComboboxLabel'),
        trigger: () => qs(container, '.ComboboxTrigger'),
        input: () => qs(container, '.ComboboxInput'),
        firstChip: () => qs(container, '.ComboboxChip'),
        loadingIndicator: () => qs(container, '.ComboboxLoadingIndicator'),
        clear: () => qs(container, '.ComboboxClear'),
        arrow: () => qs(container, '.ComboboxArrow'),
        listbox: () => qs(container, '.ComboboxListbox'),
        firstOption: () => qs(container, '.ComboboxOption'),
    };

    return {
        ...utils,
        getItemsMock: getItems,
        onChange,
        getInput: () => qs<HTMLInputElement>(container, '.ComboboxInput')!,
        getTrigger: () => qs(container, '.ComboboxTrigger')!,
        getListbox: () => qs(container, '.ComboboxListbox')!,
        getOptions: () => qsAll<HTMLLIElement>(container, '.ComboboxOption'),
        getChips: () => qsAll(container, '.ComboboxChip'),
        getChipRemoves: () => qsAll(container, '.ComboboxChipRemove'),
        getClear: () => qs(container, '.ComboboxClear'),
        getLabel: () => qs(container, '.ComboboxLabel'),
        getLoadingIndicator: () => qs(container, '.ComboboxLoadingIndicator'),
        getSelectedItemProbe: () => qs(container, '.BranchProbeSelectedItem'),
        getMessage: (type) => qs(container, `.ComboboxMessage--${type}`),
        snapshotAttrs: () => collectDataAttrs(parts),
    };
};
