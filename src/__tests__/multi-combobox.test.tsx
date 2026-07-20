// Created by: Andrey Polyakov (andrey@polyakov.im)

import {act, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, test, vi} from 'vitest';

import {
    CITIES,
    City,
    createDeferredGetItems,
    createGetItemsMock,
    createPaginatedGetItemsMock,
    flush,
    renderMultiCombobox,
} from './fixtures';

describe('DownshiftMultiCombobox', () => {
    test('opens on focus, selects an option and renders it as a chip', async () => {
        const user = userEvent.setup();
        const {getInput, getListbox, getOptions, getChips, onChange} =
            renderMultiCombobox();

        await user.click(getInput());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        expect(getListbox()).toHaveAttribute('data-is-open', 'true');

        const target = getOptions().find(
            (option) => option.textContent === 'Berlin',
        );
        expect(target).toBeDefined();
        await user.click(target!);

        await waitFor(() => expect(getChips()).toHaveLength(1));
        expect(getChips()[0]).toHaveTextContent('Berlin');
        expect(onChange).toHaveBeenCalledWith([
            expect.objectContaining({name: 'Berlin'}),
        ]);
    });

    test('does not call getItems on mount', async () => {
        const {getItemsMock} = renderMultiCombobox();
        await flush();
        expect(getItemsMock).not.toHaveBeenCalled();
    });

    test('a selected item disappears from the visible list', async () => {
        const user = userEvent.setup();
        const {getInput, getOptions} = renderMultiCombobox();

        await user.click(getInput());
        await waitFor(() => expect(getOptions()).toHaveLength(CITIES.length));

        const berlin = getOptions().find(
            (option) => option.textContent === 'Berlin',
        )!;
        await user.click(berlin);

        await waitFor(() =>
            expect(getOptions()).toHaveLength(CITIES.length - 1),
        );
        expect(
            getOptions().some((option) => option.textContent === 'Berlin'),
        ).toBe(false);
    });

    test('after selecting an option the menu stays open and the input is cleared', async () => {
        const user = userEvent.setup();
        const {getInput, getListbox, getOptions} = renderMultiCombobox();

        await user.click(getInput());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        await user.type(getInput(), 'Ber');
        await waitFor(() =>
            expect(getOptions().some((o) => o.textContent === 'Berlin')).toBe(
                true,
            ),
        );

        const berlin = getOptions().find((o) => o.textContent === 'Berlin')!;
        await user.click(berlin);

        await waitFor(() =>
            expect(getListbox()).toHaveAttribute('data-is-open', 'true'),
        );
        expect(getInput().value).toBe('');
    });

    test('onChange accumulates previously selected items', async () => {
        const user = userEvent.setup();
        const {getInput, getOptions, onChange} = renderMultiCombobox();

        await user.click(getInput());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        await user.click(getOptions().find((o) => o.textContent === 'Berlin')!);
        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1));

        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        await user.click(getOptions().find((o) => o.textContent === 'Paris')!);
        await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2));

        expect(onChange).toHaveBeenLastCalledWith([
            expect.objectContaining({name: 'Berlin'}),
            expect.objectContaining({name: 'Paris'}),
        ]);
    });

    // Regression coverage for the `highlightedIndex` clamp in multiStateReducer:
    // once the selected item leaves visibleItems, the previous highlightedIndex
    // can point past the end of the (now shorter) list.
    test('clamps highlightedIndex so it stays valid after the selected item leaves the list', async () => {
        const user = userEvent.setup();
        const items = CITIES.slice(0, 3); // London(0), Paris(1), Berlin(2)
        const {getInput, getOptions} = renderMultiCombobox({
            getItems: createGetItemsMock(items),
        });

        await user.click(getInput());
        await waitFor(() => expect(getOptions()).toHaveLength(3));

        // Highlight the last item (Berlin, index 2) and select it via Enter, so
        // the reducer sees state.highlightedIndex === 2 at selection time.
        await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
        await waitFor(() =>
            expect(getOptions()[2]).toHaveAttribute('data-is-active', 'true'),
        );
        await user.keyboard('{Enter}');

        // visibleItems shrinks to [London, Paris]; highlightedIndex must clamp to
        // the new last index (1 = Paris), not remain at the stale 2.
        await waitFor(() => expect(getOptions()).toHaveLength(2));
        const active = getOptions().filter(
            (option) => option.getAttribute('data-is-active') === 'true',
        );
        expect(active).toHaveLength(1);
        expect(active[0]).toHaveTextContent('Paris');
    });

    test('Backspace on an empty, closed input removes the last selected item', async () => {
        const user = userEvent.setup();
        const {getInput, getListbox, getOptions, getChips} =
            renderMultiCombobox();

        await user.click(getInput());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        await user.click(getOptions().find((o) => o.textContent === 'Berlin')!);
        await waitFor(() => expect(getChips()).toHaveLength(1));

        // The dropdown's own key handling (incl. Backspace-removes-last-chip) is
        // suppressed while the menu is open (`preventKeyAction: isOpen`) - close it
        // first, without blurring, so isInputFocused stays true and the effect that
        // reopens on focus doesn't fire again.
        await user.keyboard('{Escape}');
        await waitFor(() =>
            expect(getListbox()).toHaveAttribute('data-is-open', 'false'),
        );

        await user.keyboard('{Backspace}');
        await waitFor(() => expect(getChips()).toHaveLength(0));
    });

    test('removing a chip via ChipRemove excludes just that item', async () => {
        const user = userEvent.setup();
        const {getInput, getOptions, getChips, getChipRemoves, onChange} =
            renderMultiCombobox();

        await user.click(getInput());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        await user.click(getOptions().find((o) => o.textContent === 'London')!);
        await waitFor(() => expect(getChips()).toHaveLength(1));
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        await user.click(getOptions().find((o) => o.textContent === 'Paris')!);
        await waitFor(() => expect(getChips()).toHaveLength(2));

        const londonRemove = getChipRemoves().find((el) =>
            el.closest('.ComboboxChip')?.textContent?.includes('London'),
        )!;
        await user.click(londonRemove);

        await waitFor(() => expect(getChips()).toHaveLength(1));
        expect(getChips()[0]).toHaveTextContent('Paris');
        expect(onChange).toHaveBeenLastCalledWith([
            expect.objectContaining({name: 'Paris'}),
        ]);
    });

    test('arrow-key navigation across chips sets data-is-active, and Backspace removes the active chip', async () => {
        const user = userEvent.setup();
        const {getInput, getListbox, getOptions, getChips} =
            renderMultiCombobox();

        await user.click(getInput());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        await user.click(getOptions().find((o) => o.textContent === 'London')!);
        await waitFor(() => expect(getChips()).toHaveLength(1));
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        await user.click(getOptions().find((o) => o.textContent === 'Paris')!);
        await waitFor(() => expect(getChips()).toHaveLength(2));

        await user.keyboard('{Escape}');
        await waitFor(() =>
            expect(getListbox()).toHaveAttribute('data-is-open', 'false'),
        );

        // ArrowLeft on the (empty, closed) dropdown input jumps activeIndex to the
        // last chip and native downshift focuses it.
        await user.keyboard('{ArrowLeft}');
        await waitFor(() =>
            expect(getChips()[1]).toHaveAttribute('data-is-active', 'true'),
        );
        expect(getChips()[0]).toHaveAttribute('data-is-active', 'false');

        // Backspace on the now-focused/active chip removes it via
        // SelectedItemKeyDownBackspace.
        await user.keyboard('{Backspace}');
        await waitFor(() => expect(getChips()).toHaveLength(1));
        expect(getChips()[0]).toHaveTextContent('London');
    });

    test('a deferred getItems surfaces loading, then noResults, then error', async () => {
        const user = userEvent.setup();
        const deferred = createDeferredGetItems<City, number>();
        const {getInput, getListbox, getMessage} = renderMultiCombobox({
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

    test('debounces getItems calls while typing quickly', async () => {
        vi.useFakeTimers();
        try {
            const {getInput, getItemsMock} = renderMultiCombobox({
                debounceTime: 300,
            });

            // Flush the open-triggered fetch's microtask outside fireEvent's own
            // act() wrapper - see combobox.test.tsx for why this matters under
            // fake timers.
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
                await vi.advanceTimersByTimeAsync(0);
            });

            expect(getItemsMock).toHaveBeenCalledTimes(1);
            expect(getItemsMock).toHaveBeenLastCalledWith(
                expect.objectContaining({filterText: 'ber'}),
                undefined,
            );
        } finally {
            vi.useRealTimers();
        }
    });

    test('isItemDisabled marks an option disabled, unselectable and skipped by arrow navigation', async () => {
        const user = userEvent.setup();
        const items = CITIES.slice(0, 3); // London, Paris, Berlin
        const isItemDisabled = (item: City) => item.name === 'Paris';
        const {getInput, getOptions, getChips} = renderMultiCombobox({
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
        expect(getChips()).toHaveLength(0);

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

    test('disabled prevents the menu from opening and marks the trigger/input disabled', async () => {
        const user = userEvent.setup();
        const {getInput, getTrigger, getListbox, getItemsMock} =
            renderMultiCombobox({disabled: true});

        expect(getTrigger()).toHaveAttribute('data-is-disabled', 'true');
        expect(getInput()).toBeDisabled();

        await user.click(getTrigger());
        await flush();

        expect(getListbox()).toHaveAttribute('data-is-open', 'false');
        expect(getItemsMock).not.toHaveBeenCalled();
    });

    test('reaching the last non-disabled item via keyboard triggers loadMore', async () => {
        const user = userEvent.setup();
        const getItems = createPaginatedGetItemsMock(CITIES, 2);
        const {getInput, getOptions} = renderMultiCombobox({getItems});

        await user.click(getInput());
        await waitFor(() => expect(getOptions()).toHaveLength(2));

        await user.keyboard('{ArrowDown}{ArrowDown}');
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(2));
        expect(getItems).toHaveBeenCalledTimes(2);
    });

    test('scrolling near the bottom of the listbox triggers loadMore', async () => {
        const user = userEvent.setup();
        const getItems = createPaginatedGetItemsMock(CITIES, 2);
        const {getInput, getListbox, getOptions} = renderMultiCombobox({
            getItems,
        });

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
});
