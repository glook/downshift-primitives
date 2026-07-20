// Created by: Andrey Polyakov (andrey@polyakov.im)

import {fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
    UseComboboxState,
    UseComboboxStateChangeOptions,
    useCombobox,
} from 'downshift';
import {describe, expect, test, vi} from 'vitest';

import {
    CITIES,
    City,
    createDeferredGetItems,
    createGetItemsMock,
    flush,
    renderCombobox,
    renderMultiCombobox,
    renderSelect,
} from './fixtures';

/**
 * The `data-*` attributes are the whole styling API of this library: a consumer
 * has nothing else to hook CSS onto. These snapshots pin the attribute names and
 * the "absent vs literal false" distinction, both of which are breaking changes
 * that behaviour tests keep green.
 */
describe('data-attribute contract', () => {
    describe('DownshiftCombobox', () => {
        test('closed and empty', async () => {
            const {snapshotAttrs} = renderCombobox();
            await flush();

            expect(snapshotAttrs()).toMatchInlineSnapshot(`
              {
                "arrow": {
                  "data-is-open": "false",
                },
                "clear": null,
                "firstOption": null,
                "input": {
                  "data-has-selected-item": "false",
                  "data-is-focused": "false",
                },
                "label": {},
                "listbox": {
                  "data-has-error": "false",
                  "data-has-no-items": "false",
                  "data-is-loading": "false",
                  "data-is-open": "false",
                  "data-loading-state": "idle",
                },
                "loadingIndicator": null,
                "selectedItem": null,
                "trigger": {
                  "data-has-item": "false",
                  "data-is-focused": "false",
                  "data-is-hovered": "false",
                  "data-is-open": "false",
                },
              }
            `);
        });

        test('open, hovered, focused and with a selected item', async () => {
            const user = userEvent.setup();
            const {getInput, getOptions, snapshotAttrs} = renderCombobox();

            await user.click(getInput());
            await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
            await user.click(
                getOptions().find((option) => option.textContent === 'Berlin')!,
            );

            // reopen: selecting closes the menu, and the input value now filters
            // the list down to the selected item itself
            await user.click(getInput());
            await waitFor(() => expect(getOptions()).toHaveLength(1));

            expect(snapshotAttrs()).toMatchInlineSnapshot(`
              {
                "arrow": {
                  "data-is-open": "true",
                },
                "clear": {},
                "firstOption": {
                  "data-is-active": "true",
                  "data-is-disabled": "false",
                  "data-is-selected": "true",
                },
                "input": {
                  "data-has-selected-item": "true",
                  "data-is-focused": "true",
                },
                "label": {},
                "listbox": {
                  "data-has-error": "false",
                  "data-has-no-items": "false",
                  "data-is-loading": "false",
                  "data-is-open": "true",
                  "data-loading-state": "idle",
                },
                "loadingIndicator": null,
                "selectedItem": {
                  "data-has-input-value": "true",
                  "data-is-focused": "true",
                  "data-type": "combobox",
                },
                "trigger": {
                  "data-has-item": "true",
                  "data-is-focused": "true",
                  "data-is-hovered": "true",
                  "data-is-open": "true",
                },
              }
            `);
        });
    });

    describe('DownshiftSelect', () => {
        test('closed and empty', async () => {
            const {snapshotAttrs} = renderSelect();
            await flush();

            expect(snapshotAttrs()).toMatchInlineSnapshot(`
              {
                "arrow": {
                  "data-is-open": "false",
                },
                "clear": null,
                "firstOption": null,
                "label": {},
                "listbox": {
                  "data-has-error": "false",
                  "data-has-no-items": "false",
                  "data-is-loading": "false",
                  "data-is-open": "false",
                  "data-loading-state": "idle",
                },
                "loadingIndicator": null,
                "placeholder": {
                  "data-is-hovered": "false",
                },
                "selectedItem": null,
                "trigger": {
                  "data-has-item": "false",
                  "data-is-hovered": "false",
                  "data-is-open": "false",
                },
              }
            `);
        });

        test('open, hovered and with a selected item', async () => {
            const user = userEvent.setup();
            const {getTrigger, getOptions, snapshotAttrs} = renderSelect();

            await user.click(getTrigger());
            await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
            await user.click(
                getOptions().find((option) => option.textContent === 'Berlin')!,
            );
            await user.click(getTrigger());
            await waitFor(() =>
                expect(getOptions()).toHaveLength(CITIES.length),
            );

            expect(snapshotAttrs()).toMatchInlineSnapshot(`
              {
                "arrow": {
                  "data-is-open": "true",
                },
                "clear": {},
                "firstOption": {
                  "data-is-active": "false",
                  "data-is-disabled": "false",
                  "data-is-selected": "false",
                },
                "label": {},
                "listbox": {
                  "data-has-error": "false",
                  "data-has-no-items": "false",
                  "data-is-loading": "false",
                  "data-is-open": "true",
                  "data-loading-state": "idle",
                },
                "loadingIndicator": null,
                "placeholder": null,
                "selectedItem": {
                  "data-type": "select",
                },
                "trigger": {
                  "data-has-item": "true",
                  "data-is-hovered": "true",
                  "data-is-open": "true",
                },
              }
            `);
        });
    });

    describe('DownshiftMultiCombobox', () => {
        test('closed and empty', async () => {
            const {snapshotAttrs} = renderMultiCombobox();
            await flush();

            expect(snapshotAttrs()).toMatchInlineSnapshot(`
              {
                "arrow": {
                  "data-is-open": "false",
                },
                "clear": null,
                "firstChip": null,
                "firstOption": null,
                "input": {
                  "data-has-selected-item": "false",
                  "data-is-focused": "false",
                },
                "label": {},
                "listbox": {
                  "data-has-error": "false",
                  "data-has-no-items": "false",
                  "data-is-loading": "false",
                  "data-is-open": "false",
                  "data-loading-state": "idle",
                },
                "loadingIndicator": null,
                "trigger": {
                  "data-has-item": "false",
                  "data-is-focused": "false",
                  "data-is-hovered": "false",
                  "data-is-open": "false",
                },
              }
            `);
        });

        test('open, hovered and with one chip', async () => {
            const user = userEvent.setup();
            const {getInput, getTrigger, getOptions, getChips, snapshotAttrs} =
                renderMultiCombobox();

            await user.click(getInput());
            await waitFor(() =>
                expect(getOptions()).toHaveLength(CITIES.length),
            );
            await user.click(
                getOptions().find((option) => option.textContent === 'Berlin')!,
            );
            await waitFor(() => expect(getChips()).toHaveLength(1));
            // clicking an option moved the pointer out of the trigger
            await user.hover(getTrigger());

            expect(snapshotAttrs()).toMatchInlineSnapshot(`
              {
                "arrow": {
                  "data-is-open": "true",
                },
                "clear": null,
                "firstChip": {
                  "data-is-active": "false",
                },
                "firstOption": {
                  "data-is-active": "false",
                  "data-is-disabled": "false",
                  "data-is-selected": "false",
                },
                "input": {
                  "data-has-selected-item": "true",
                  "data-is-focused": "true",
                },
                "label": {},
                "listbox": {
                  "data-has-error": "false",
                  "data-has-no-items": "false",
                  "data-is-loading": "false",
                  "data-is-open": "true",
                  "data-loading-state": "idle",
                },
                "loadingIndicator": null,
                "trigger": {
                  "data-has-item": "true",
                  "data-is-focused": "true",
                  "data-is-hovered": "true",
                  "data-is-open": "true",
                },
              }
            `);
        });

        test('SelectedItem renders null (chips replace it)', () => {
            const {getSelectedItemProbe} = renderMultiCombobox();
            expect(getSelectedItemProbe()).toBeNull();
        });

        // Known limitation, pinned so it cannot change silently: useCombobox is fed
        // a controlled `selectedItem: null`, and the Clear dispatcher routes
        // non-combobox roots to the Select branch, which gates on that same
        // `selectedItem`. Clear is therefore inert here no matter how many chips
        // exist - removal goes through ChipRemove or Backspace instead.
        test('Clear never renders, even with chips selected', async () => {
            const user = userEvent.setup();
            const {getInput, getOptions, getChips, getClear} =
                renderMultiCombobox();

            expect(getClear()).toBeNull();

            await user.click(getInput());
            await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
            await user.click(
                getOptions().find((option) => option.textContent === 'Berlin')!,
            );
            await waitFor(() => expect(getChips()).toHaveLength(1));

            expect(getClear()).toBeNull();
        });
    });

    describe('data-is-selected', () => {
        test('combobox marks the option matching the selected item', async () => {
            const user = userEvent.setup();
            const {getInput, getOptions} = renderCombobox();

            await user.click(getInput());
            await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
            await user.click(
                getOptions().find((option) => option.textContent === 'Berlin')!,
            );
            await user.click(getInput());
            await waitFor(() => expect(getOptions()).toHaveLength(1));

            expect(getOptions()[0]).toHaveAttribute('data-is-selected', 'true');
        });

        test('select marks the option matching the selected item', async () => {
            const user = userEvent.setup();
            const {getTrigger, getOptions} = renderSelect();

            await user.click(getTrigger());
            await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
            await user.click(
                getOptions().find((option) => option.textContent === 'Berlin')!,
            );
            await user.click(getTrigger());
            await waitFor(() =>
                expect(getOptions()).toHaveLength(CITIES.length),
            );

            const berlin = getOptions().find(
                (option) => option.textContent === 'Berlin',
            )!;
            expect(berlin).toHaveAttribute('data-is-selected', 'true');
            expect(
                getOptions().find((option) => option.textContent === 'London'),
            ).toHaveAttribute('data-is-selected', 'false');
        });

        // MultiCombobox drops the picked items from `visibleItems` before they reach
        // useCombobox, so no rendered option can ever be the selected one. Consumers
        // must style chips, not `[data-is-selected]`.
        test('multi-combobox never marks a visible option as selected', async () => {
            const user = userEvent.setup();
            const {getInput, getOptions, getChips} = renderMultiCombobox();

            await user.click(getInput());
            await waitFor(() =>
                expect(getOptions()).toHaveLength(CITIES.length),
            );
            await user.click(
                getOptions().find((option) => option.textContent === 'Berlin')!,
            );
            await waitFor(() => expect(getChips()).toHaveLength(1));

            expect(
                getOptions().every(
                    (option) =>
                        option.getAttribute('data-is-selected') === 'false',
                ),
            ).toBe(true);
        });
    });

    test('data-loading-state goes loading -> idle -> loadingMore -> idle across pagination', async () => {
        const user = userEvent.setup();
        const deferred = createDeferredGetItems<City, number>();
        const {
            getInput,
            getListbox,
            getOptions,
            getMessage,
            getLoadingIndicator,
        } = renderCombobox({getItems: deferred.getItems});

        await user.click(getInput());
        await waitFor(() => expect(getMessage('loading')).not.toBeNull());
        expect(getLoadingIndicator()).not.toBeNull();
        expect(getMessage('loadingMore')).toBeNull();

        deferred.resolveNext({items: CITIES.slice(0, 2), cursor: 1});
        await waitFor(() => expect(getOptions()).toHaveLength(2));
        expect(getListbox()).toHaveAttribute('data-loading-state', 'idle');

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

        await waitFor(() =>
            expect(getListbox()).toHaveAttribute(
                'data-loading-state',
                'loadingMore',
            ),
        );
        // loadingMore must not also light up the plain loading slot, otherwise the
        // list would be replaced by a spinner instead of appending below it
        expect(getMessage('loadingMore')).not.toBeNull();
        expect(getMessage('loading')).toBeNull();

        deferred.resolveNext({items: CITIES.slice(2, 4)});
        await waitFor(() => expect(getOptions()).toHaveLength(4));
        expect(getListbox()).toHaveAttribute('data-loading-state', 'idle');
        expect(getMessage('loadingMore')).toBeNull();
    });

    // `isLoading` (the prop) and `loadingState` (from useAsyncList) are separate
    // sources that both surface as `data-is-loading`: Trigger and LoadingIndicator
    // read the merged context flag, Listbox and OptionState derive theirs from
    // loadingState alone. The two therefore legitimately disagree.
    test('the external isLoading prop drives Trigger and LoadingIndicator but not Listbox', async () => {
        const user = userEvent.setup();
        const {
            getInput,
            getTrigger,
            getListbox,
            getOptions,
            getLoadingIndicator,
            getMessage,
        } = renderCombobox({isLoading: true});

        await user.click(getInput());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));

        expect(getTrigger()).toHaveAttribute('data-is-loading', 'true');
        expect(getLoadingIndicator()).not.toBeNull();

        expect(getListbox()).toHaveAttribute('data-loading-state', 'idle');
        expect(getListbox()).toHaveAttribute('data-is-loading', 'false');
        expect(getMessage('loading')).toBeNull();
    });

    test('a user stateReducer runs first, but the anti-wrap clamp still wins over it', async () => {
        const user = userEvent.setup();
        let arrowDownCalls = 0;

        const stateReducer = vi.fn(
            (
                _state: UseComboboxState<City>,
                {type, changes}: UseComboboxStateChangeOptions<City>,
            ): Partial<UseComboboxState<City>> => {
                if (
                    type !== useCombobox.stateChangeTypes.InputKeyDownArrowDown
                ) {
                    return changes;
                }
                // first press jumps straight to the last item, the second one tries
                // to jump back up - which ArrowDown must never do
                const highlightedIndex = arrowDownCalls === 0 ? 2 : 0;
                arrowDownCalls += 1;
                return {...changes, highlightedIndex};
            },
        );

        const {getInput, getOptions} = renderCombobox({
            getItems: createGetItemsMock(CITIES.slice(0, 3)),
            stateReducer,
        });

        await user.click(getInput());
        await waitFor(() => expect(getOptions()).toHaveLength(3));

        await user.keyboard('{ArrowDown}');
        await waitFor(() =>
            expect(getOptions()[2]).toHaveAttribute('data-is-active', 'true'),
        );

        await user.keyboard('{ArrowDown}');
        expect(getOptions()[2]).toHaveAttribute('data-is-active', 'true');
        expect(getOptions()[0]).toHaveAttribute('data-is-active', 'false');
        expect(stateReducer).toHaveBeenCalled();
    });
});
