// Created by: Andrey Polyakov (andrey@polyakov.im)

import {fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, test} from 'vitest';

import {
    CITIES,
    createDeferredGetItems,
    createGetItemsMock,
    createPaginatedGetItemsMock,
    City,
    flush,
    renderSelect,
} from './fixtures';

describe('DownshiftSelect', () => {
    test('opens on trigger click, selects an option and renders it as SelectedItem', async () => {
        const user = userEvent.setup();
        const {getTrigger, getListbox, getOptions, getSelectedItem} =
            renderSelect();

        expect(getListbox()).toHaveAttribute('data-is-open', 'false');

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        expect(getListbox()).toHaveAttribute('data-is-open', 'true');

        const target = getOptions().find(
            (option) => option.textContent === 'Berlin',
        );
        expect(target).toBeDefined();
        await user.click(target!);

        await waitFor(() => expect(getSelectedItem()).not.toBeNull());
        expect(getSelectedItem()).toHaveTextContent('Berlin');
    });

    // Scenario 13 (see combobox.test.tsx for the Placeholder-in-Combobox half):
    // the Input dispatcher must not render inside a select tree.
    test('Input renders null inside a select tree (type branch dispatch)', () => {
        const {getInputProbe} = renderSelect();
        expect(getInputProbe()).toBeNull();
    });

    test('does not call getItems on mount', async () => {
        const {getItemsMock} = renderSelect();
        await flush();
        expect(getItemsMock).not.toHaveBeenCalled();
    });

    test('reopening the menu triggers a fresh load every time (no filterText caching)', async () => {
        const user = userEvent.setup();
        const {getTrigger, getListbox, getItemsMock, getOptions} =
            renderSelect();

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        expect(getItemsMock).toHaveBeenCalledTimes(1);

        await user.keyboard('{Escape}');
        await waitFor(() =>
            expect(getListbox()).toHaveAttribute('data-is-open', 'false'),
        );

        await user.click(getTrigger());
        await waitFor(() => expect(getItemsMock).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
    });

    test('closing the menu clears items', async () => {
        const user = userEvent.setup();
        const {getTrigger, getListbox, getOptions} = renderSelect();

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));

        await user.keyboard('{Escape}');
        await waitFor(() =>
            expect(getListbox()).toHaveAttribute('data-is-open', 'false'),
        );
        expect(getOptions()).toHaveLength(0);
    });

    test('selecting an option sets data-has-item on the trigger (hasSelectedItem fallback)', async () => {
        const user = userEvent.setup();
        const {getTrigger, getOptions} = renderSelect();

        expect(getTrigger()).toHaveAttribute('data-has-item', 'false');

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        const target = getOptions().find(
            (option) => option.textContent === 'Berlin',
        )!;
        await user.click(target);

        await waitFor(() =>
            expect(getTrigger()).toHaveAttribute('data-has-item', 'true'),
        );
    });

    // useSelect (unlike useCombobox) does not pass `circular: true` to its
    // internal getHighlightedIndex - so, contrary to what one might expect from
    // a component with no custom stateReducer, arrow navigation already clamps
    // at the boundaries natively. This documents the actual behaviour instead of
    // assuming it wraps.
    test('ArrowDown navigates and clamps at the last item without wrapping (native useSelect behaviour)', async () => {
        const user = userEvent.setup();
        const items = CITIES.slice(0, 3); // London, Paris, Berlin
        const {getTrigger, getListbox, getOptions} = renderSelect({
            getItems: createGetItemsMock(items),
        });

        getTrigger().focus();
        await user.keyboard('{ArrowDown}');
        await waitFor(() => expect(getOptions()).toHaveLength(3));
        expect(getListbox()).toHaveAttribute('data-is-open', 'true');

        await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
        await waitFor(() =>
            expect(getOptions()[2]).toHaveAttribute('data-is-active', 'true'),
        );

        // One more ArrowDown at the last item must not wrap back to the first.
        await user.keyboard('{ArrowDown}');
        expect(getOptions()[2]).toHaveAttribute('data-is-active', 'true');
        expect(getOptions()[0]).toHaveAttribute('data-is-active', 'false');
    });

    test('Enter selects the highlighted option and Escape closes the menu', async () => {
        const user = userEvent.setup();
        const items = CITIES.slice(0, 3); // London, Paris, Berlin
        const {getTrigger, getListbox, getOptions, getSelectedItem} =
            renderSelect({getItems: createGetItemsMock(items)});

        getTrigger().focus();
        await user.keyboard('{ArrowDown}');
        await waitFor(() => expect(getOptions()).toHaveLength(3));

        await user.keyboard('{ArrowDown}{Enter}');
        await waitFor(() => expect(getSelectedItem()).not.toBeNull());
        expect(getSelectedItem()).toHaveTextContent('London');

        await user.click(getTrigger());
        await waitFor(() =>
            expect(getListbox()).toHaveAttribute('data-is-open', 'true'),
        );
        await user.keyboard('{Escape}');
        await waitFor(() =>
            expect(getListbox()).toHaveAttribute('data-is-open', 'false'),
        );
    });

    test('a deferred getItems surfaces loading, then noResults, then error on reopen', async () => {
        const user = userEvent.setup();
        const deferred = createDeferredGetItems<City, number>();
        const {getTrigger, getListbox, getMessage} = renderSelect({
            getItems: deferred.getItems,
        });

        await user.click(getTrigger());
        await waitFor(() => expect(getMessage('loading')).not.toBeNull());
        expect(getListbox()).toHaveAttribute('data-is-loading', 'true');

        deferred.resolveNext({items: []});
        await waitFor(() => expect(getMessage('noResults')).not.toBeNull());
        expect(getMessage('loading')).toBeNull();

        await user.keyboard('{Escape}');
        await waitFor(() =>
            expect(getListbox()).toHaveAttribute('data-is-open', 'false'),
        );
        await user.click(getTrigger());
        await waitFor(() => expect(deferred.pendingCount()).toBeGreaterThan(0));
        deferred.rejectNext(new Error('boom'));

        await waitFor(() => expect(getMessage('error')).not.toBeNull());
        expect(getListbox()).toHaveAttribute('data-has-error', 'true');
    });

    test('isItemDisabled marks an option disabled, unselectable and skipped by arrow navigation', async () => {
        const user = userEvent.setup();
        const items = CITIES.slice(0, 3); // London, Paris, Berlin
        const isItemDisabled = (item: City) => item.name === 'Paris';
        const {getTrigger, getOptions, getSelectedItem} = renderSelect({
            getItems: createGetItemsMock(items),
            isItemDisabled,
        });

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions()).toHaveLength(3));

        const paris = getOptions().find(
            (option) => option.textContent === 'Paris',
        )!;
        expect(paris).toHaveAttribute('data-is-disabled', 'true');

        await user.click(paris);
        expect(getSelectedItem()).toBeNull();

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

    test('disabled prevents the menu from opening and marks the trigger disabled', async () => {
        const user = userEvent.setup();
        const {getTrigger, getListbox, getItemsMock} = renderSelect({
            disabled: true,
        });

        expect(getTrigger()).toHaveAttribute('data-is-disabled', 'true');

        await user.click(getTrigger());
        await flush();

        expect(getListbox()).toHaveAttribute('data-is-open', 'false');
        expect(getItemsMock).not.toHaveBeenCalled();
    });

    test('loadMore: reaching the last non-disabled item via keyboard loads the next page', async () => {
        const user = userEvent.setup();
        const getItems = createPaginatedGetItemsMock(CITIES, 2);
        const {getTrigger, getOptions} = renderSelect({getItems});

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions()).toHaveLength(2));

        await user.keyboard('{ArrowDown}{ArrowDown}');
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(2));
        expect(getItems).toHaveBeenCalledTimes(2);
    });

    test('loadMore: scrolling near the bottom of the listbox loads the next page', async () => {
        const user = userEvent.setup();
        const getItems = createPaginatedGetItemsMock(CITIES, 2);
        const {getTrigger, getListbox, getOptions} = renderSelect({getItems});

        await user.click(getTrigger());
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

    test('Placeholder renders (unlike combobox) and disappears once an item is selected', async () => {
        const user = userEvent.setup();
        const {getTrigger, getPlaceholder, getOptions} = renderSelect();

        expect(getPlaceholder()).not.toBeNull();
        expect(getPlaceholder()).toHaveTextContent('Select a city');

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        const target = getOptions().find(
            (option) => option.textContent === 'Berlin',
        )!;
        await user.click(target);

        await waitFor(() => expect(getPlaceholder()).toBeNull());
    });

    test('Clear resets the selection', async () => {
        const user = userEvent.setup();
        const {getTrigger, getOptions, getClear, getSelectedItem} =
            renderSelect();

        expect(getClear()).toBeNull();

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        await user.click(getOptions()[0]);
        await waitFor(() => expect(getSelectedItem()).not.toBeNull());

        const clear = getClear();
        expect(clear).not.toBeNull();
        await user.click(clear!);

        expect(getSelectedItem()).toBeNull();
    });
});
