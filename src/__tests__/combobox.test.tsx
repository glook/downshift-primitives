// Created by: Andrey Polyakov (andrey@polyakov.im)

import {act, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, test, vi} from 'vitest';

import type {DownshiftGetItemsFn} from '../interface';
import {
    CITIES,
    City,
    createDeferredGetItems,
    createGetItemsMock,
    cityToString,
    renderCombobox,
} from './fixtures';

/** Paginated getItems: each page has `pageSize` items, cursor advances until exhausted. */
const createPaginatedGetItemsMock = (
    items: City[],
    pageSize: number,
): DownshiftGetItemsFn<City, number> =>
    vi.fn(async ({filterText}, cursor) => {
        const page = cursor ?? 0;
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
    }) as unknown as DownshiftGetItemsFn<City, number>;

/** Flushes pending microtasks (e.g. the swallowed first `useAsyncList` load). */
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('DownshiftCombobox', () => {
    // Regression: an `initialInputValue = ''` default used to disable downshift's
    // own derivation of inputValue from initialSelectedItem in getInitialState.
    test('prefills the input from initialSelectedItem when initialInputValue is not set', () => {
        const selected = CITIES[0];
        const {getInput} = renderCombobox({initialSelectedItem: selected});
        expect(getInput().value).toBe(cityToString(selected));
    });

    test('an explicit initialInputValue overrides the value derived from initialSelectedItem', () => {
        const selected = CITIES[0];
        const {getInput} = renderCombobox({
            initialSelectedItem: selected,
            initialInputValue: 'custom text',
        });
        expect(getInput().value).toBe('custom text');
    });

    test('does not call getItems on mount', async () => {
        const {getItemsMock} = renderCombobox();
        await flush();
        expect(getItemsMock).not.toHaveBeenCalled();
    });

    test('focusing the input opens the menu', async () => {
        const user = userEvent.setup();
        const {getInput, getListbox} = renderCombobox();
        expect(getListbox()).toHaveAttribute('data-is-open', 'false');

        await user.click(getInput());
        await waitFor(() =>
            expect(getListbox()).toHaveAttribute('data-is-open', 'true'),
        );
    });

    test('typing updates the filter text passed to getItems and re-renders the list', async () => {
        const user = userEvent.setup();
        const {getInput, getItemsMock, getOptions} = renderCombobox();

        await user.click(getInput());
        await waitFor(() => expect(getItemsMock).toHaveBeenCalled());
        (getItemsMock as ReturnType<typeof vi.fn>).mockClear();

        await user.type(getInput(), 'Berlin');

        await waitFor(() =>
            // getItems is called with (state, cursor); cursor is `null` (not
            // undefined) when there is no next page yet - see dispatchFetch in
            // @react-stately/data.
            expect(getItemsMock).toHaveBeenLastCalledWith(
                expect.objectContaining({filterText: 'Berlin'}),
                null,
            ),
        );
        await waitFor(() => {
            const options = getOptions();
            expect(options).toHaveLength(1);
            expect(options[0]).toHaveTextContent('Berlin');
        });
    });

    test('closing the menu clears items; reopening triggers a fresh load', async () => {
        const user = userEvent.setup();
        const {getInput, getListbox, getItemsMock, getOptions} =
            renderCombobox();

        await user.click(getInput());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        const callsAfterOpen = (getItemsMock as ReturnType<typeof vi.fn>).mock
            .calls.length;

        await user.keyboard('{Escape}');
        await waitFor(() =>
            expect(getListbox()).toHaveAttribute('data-is-open', 'false'),
        );
        expect(getOptions()).toHaveLength(0);

        await user.click(getInput());
        await waitFor(() =>
            expect(
                (getItemsMock as ReturnType<typeof vi.fn>).mock.calls.length,
            ).toBeGreaterThan(callsAfterOpen),
        );
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
    });

    test('selecting an option renders SelectedItem and sets the input value', async () => {
        const user = userEvent.setup();
        const {getInput, getOptions, getSelectedItem} = renderCombobox();

        await user.click(getInput());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));

        const target = getOptions().find(
            (option) => option.textContent === 'Berlin',
        );
        expect(target).toBeDefined();
        await user.click(target!);

        expect(getInput().value).toBe('Berlin');
        expect(getInput()).toHaveAttribute('data-has-selected-item', 'true');
        await waitFor(() => expect(getSelectedItem()).not.toBeNull());
        expect(getSelectedItem()).toHaveTextContent('Berlin');
    });

    test('ArrowDown/ArrowUp do not wrap around at the list boundaries', async () => {
        const user = userEvent.setup();
        const items = CITIES.slice(0, 3);
        const {getInput, getOptions} = renderCombobox({
            getItems: createGetItemsMock(items),
        });

        await user.click(getInput());
        await waitFor(() => expect(getOptions()).toHaveLength(3));

        await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
        await waitFor(() =>
            expect(getOptions()[2]).toHaveAttribute('data-is-active', 'true'),
        );

        // One more ArrowDown at the last item must not wrap back to the first.
        await user.keyboard('{ArrowDown}');
        expect(getOptions()[2]).toHaveAttribute('data-is-active', 'true');
        expect(getOptions()[0]).toHaveAttribute('data-is-active', 'false');

        await user.keyboard('{ArrowUp}{ArrowUp}{ArrowUp}');
        await waitFor(() =>
            expect(getOptions()[0]).toHaveAttribute('data-is-active', 'true'),
        );

        // One more ArrowUp at the first item must not wrap to the last.
        await user.keyboard('{ArrowUp}');
        expect(getOptions()[0]).toHaveAttribute('data-is-active', 'true');
        expect(getOptions()[2]).toHaveAttribute('data-is-active', 'false');
    });

    test('a deferred getItems surfaces loading, then noResults, then error', async () => {
        const user = userEvent.setup();
        const deferred = createDeferredGetItems<City, number>();
        const {getInput, getListbox, getMessage} = renderCombobox({
            getItems: deferred.getItems,
        });

        await user.click(getInput());
        await waitFor(() => expect(getMessage('loading')).not.toBeNull());
        expect(getListbox()).toHaveAttribute('data-is-loading', 'true');

        deferred.resolveNext({items: []});
        await waitFor(() => expect(getMessage('noResults')).not.toBeNull());
        expect(getMessage('loading')).toBeNull();

        await user.type(getInput(), 'x');
        await waitFor(() => expect(deferred.pendingCount()).toBeGreaterThan(0));
        deferred.rejectNext(new Error('boom'));

        await waitFor(() => expect(getMessage('error')).not.toBeNull());
        expect(getListbox()).toHaveAttribute('data-has-error', 'true');
    });

    // userEvent's async click/type hang here under fake timers: jsdom has no
    // MessageChannel, so React's scheduler falls back to setTimeout, which fake
    // timers freeze before userEvent's internal act() flush can resolve. fireEvent
    // is synchronous and side-steps that - see docs/adr note in the final report.
    test('debounces getItems calls while typing quickly', async () => {
        vi.useFakeTimers();
        try {
            const {getInput, getItemsMock} = renderCombobox({
                debounceTime: 300,
            });

            // The open-triggered fetch resolves on a microtask outside fireEvent's
            // synchronous act() wrapper - flush it here so it doesn't leak into the
            // next act() below and trip React's "update not wrapped in act" warning.
            await act(async () => {
                fireEvent.focus(getInput());
                await vi.advanceTimersByTimeAsync(0);
            });
            (getItemsMock as ReturnType<typeof vi.fn>).mockClear();

            await act(async () => {
                fireEvent.change(getInput(), {target: {value: 'b'}});
                fireEvent.change(getInput(), {target: {value: 'be'}});
                fireEvent.change(getInput(), {target: {value: 'ber'}});
            });
            expect(getItemsMock).not.toHaveBeenCalled();

            await act(async () => {
                await vi.advanceTimersByTimeAsync(300);
                // the debounce timer firing kicks off getItems, whose resolution is
                // itself a trailing microtask - flush it before act() hands back
                // control, or the resulting state update warns outside act().
                await vi.advanceTimersByTimeAsync(0);
            });

            expect(getItemsMock).toHaveBeenCalledTimes(1);
            expect(getItemsMock).toHaveBeenLastCalledWith(
                expect.objectContaining({filterText: 'ber'}),
                null,
            );
        } finally {
            vi.useRealTimers();
        }
    });

    test('reaching the last non-disabled item via keyboard triggers loadMore', async () => {
        const user = userEvent.setup();
        const getItems = createPaginatedGetItemsMock(CITIES, 2);
        const {getInput, getOptions} = renderCombobox({getItems});

        await user.click(getInput());
        await waitFor(() => expect(getOptions()).toHaveLength(2));

        await user.keyboard('{ArrowDown}{ArrowDown}');
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(2));
        expect(getItems).toHaveBeenCalledTimes(2);
    });

    test('scrolling near the bottom of the listbox triggers loadMore', async () => {
        const user = userEvent.setup();
        const getItems = createPaginatedGetItemsMock(CITIES, 2);
        const {getInput, getListbox, getOptions} = renderCombobox({getItems});

        await user.click(getInput());
        await waitFor(() => expect(getOptions()).toHaveLength(2));

        const listbox = getListbox();
        Object.defineProperty(listbox, 'scrollHeight', {
            value: 200,
            configurable: true,
        });
        Object.defineProperty(listbox, 'clientHeight', {
            value: 100,
            configurable: true,
        });
        Object.defineProperty(listbox, 'scrollTop', {
            value: 90,
            configurable: true,
        });
        fireEvent.scroll(listbox);

        await waitFor(() => expect(getOptions().length).toBeGreaterThan(2));
        expect(getItems).toHaveBeenCalledTimes(2);
    });

    test('isItemDisabled marks an option disabled, unselectable and skipped by arrow navigation', async () => {
        const user = userEvent.setup();
        const items = CITIES.slice(0, 3); // London, Paris, Berlin
        const isItemDisabled = (item: City) => item.name === 'Paris';
        const {getInput, getOptions} = renderCombobox({
            getItems: createGetItemsMock(items),
            isItemDisabled,
        });

        await user.click(getInput());
        await waitFor(() => expect(getOptions()).toHaveLength(3));

        const paris = getOptions().find(
            (option) => option.textContent === 'Paris',
        )!;
        expect(paris).toHaveAttribute('data-is-disabled', 'true');

        await user.click(paris);
        expect(getInput().value).toBe('');

        await user.keyboard('{ArrowDown}');
        await waitFor(() =>
            expect(getOptions()[0]).toHaveAttribute('data-is-active', 'true'),
        );

        await user.keyboard('{ArrowDown}');
        await waitFor(() => {
            expect(getOptions()[2]).toHaveAttribute('data-is-active', 'true');
            expect(getOptions()[1]).toHaveAttribute('data-is-active', 'false');
        });
    });

    test('Clear resets the selection and the input value', async () => {
        const user = userEvent.setup();
        const {getInput, getOptions, getClear, getSelectedItem} =
            renderCombobox();

        await user.click(getInput());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        await user.click(getOptions()[0]);
        await waitFor(() => expect(getSelectedItem()).not.toBeNull());

        const clear = getClear();
        expect(clear).not.toBeNull();
        await user.click(clear!);

        expect(getInput().value).toBe('');
        expect(getSelectedItem()).toBeNull();
    });

    // Scenario 13 (other half - Input returning null inside a Select tree - lives
    // in select.test.tsx next to the rest of the Select smoke test).
    test('Placeholder renders null inside a combobox tree (type branch dispatch)', () => {
        const {getPlaceholderProbe} = renderCombobox();
        expect(getPlaceholderProbe()).toBeNull();
    });

    test('disabled prevents the menu from opening and marks the trigger/input disabled', async () => {
        const user = userEvent.setup();
        const {getInput, getTrigger, getListbox, getItemsMock} = renderCombobox(
            {disabled: true},
        );

        expect(getTrigger()).toHaveAttribute('data-is-disabled', 'true');
        expect(getInput()).toBeDisabled();

        await user.click(getTrigger());
        await flush();

        expect(getListbox()).toHaveAttribute('data-is-open', 'false');
        expect(getItemsMock).not.toHaveBeenCalled();
    });
});
