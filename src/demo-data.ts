// Created by: Andrey Polyakov (andrey@polyakov.im)

import {DownshiftGetItemsFn} from './interface';

export interface DemoCity {
    id: string;
    name: string;
    region: string;
}

const CITIES: DemoCity[] = [
    {id: '1', name: 'London', region: 'England'},
    {id: '2', name: 'Paris', region: 'Île-de-France'},
    {id: '3', name: 'Berlin', region: 'Brandenburg'},
    {id: '4', name: 'Madrid', region: 'Community of Madrid'},
    {id: '5', name: 'Rome', region: 'Lazio'},
    {id: '6', name: 'Amsterdam', region: 'North Holland'},
    {id: '7', name: 'Vienna', region: 'Austria'},
    {id: '8', name: 'Prague', region: 'Bohemia'},
    {id: '9', name: 'Warsaw', region: 'Masovia'},
    {id: '10', name: 'Lisbon', region: 'Estremadura'},
    {id: '11', name: 'Dublin', region: 'Leinster'},
    {id: '12', name: 'Stockholm', region: 'Södermanland'},
    {id: '13', name: 'Oslo', region: 'Østlandet'},
    {id: '14', name: 'Copenhagen', region: 'Zealand'},
    {id: '15', name: 'Helsinki', region: 'Uusimaa'},
];

const PAGE_SIZE = 5;

export const getCityOptionValue = (city: DemoCity): string => city.id;

export const cityToString = (city: DemoCity | null): string =>
    city ? city.name : '';

/**
 * Demonstrates the getItems contract: filtering by filterText, cursor-based
 * pagination and request cancellation via signal.
 */
export const getCities: DownshiftGetItemsFn<DemoCity, number> = async (
    {filterText, signal},
    cursor,
) => {
    const page = cursor ?? 0;
    const query = (filterText ?? '').trim().toLowerCase();

    await new Promise((resolve) => setTimeout(resolve, 400));

    if (signal.aborted) {
        return {items: []};
    }

    const filtered = query
        ? CITIES.filter((city) => city.name.toLowerCase().includes(query))
        : CITIES;
    const items = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    return {
        items,
        cursor: items.length === PAGE_SIZE ? page + 1 : undefined,
    };
};
