// Created by: Andrey Polyakov (andrey@polyakov.im)

import {waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, test} from 'vitest';

import {flush, renderCombobox, renderMultiCombobox} from './fixtures';

describe('Combobox minLength', () => {
    test('below the threshold nothing is requested and belowMinLength replaces noResults', async () => {
        const user = userEvent.setup();
        const {getInput, getItemsMock, getListbox, getMessage} = renderCombobox(
            {minLength: 3},
        );

        await user.click(getInput());
        await user.type(getInput(), 'ab');
        await flush();

        expect(getItemsMock).not.toHaveBeenCalled();
        expect(getListbox()).toHaveAttribute('data-is-open', 'true');
        expect(getListbox()).toHaveAttribute('data-loading-state', 'idle');
        expect(getMessage('belowMinLength')).not.toBeNull();
        expect(getMessage('noResults')).toBeNull();

        await user.type(getInput(), 'c');
        await waitFor(() => expect(getItemsMock).toHaveBeenCalledTimes(1));
        expect(getItemsMock).toHaveBeenCalledWith(
            expect.objectContaining({filterText: 'abc'}),
            undefined,
        );
        await waitFor(() => expect(getMessage('belowMinLength')).toBeNull());
    });

    test('the loading indicator never flashes while below the threshold', async () => {
        const user = userEvent.setup();
        const {getInput, getListbox} = renderCombobox({minLength: 3});
        const seen: string[] = [];
        const observer = new MutationObserver((records) => {
            records.forEach((record) => {
                seen.push(
                    (record.target as HTMLElement).getAttribute(
                        'data-is-loading',
                    )!,
                );
            });
        });
        observer.observe(getListbox(), {
            attributes: true,
            attributeFilter: ['data-is-loading'],
        });

        await user.click(getInput());
        await user.type(getInput(), 'ab');
        await flush();
        observer.disconnect();

        expect(seen).not.toContain('true');
        expect(getListbox()).toHaveAttribute('data-is-loading', 'false');
    });

    test('going back below the threshold clears the results', async () => {
        const user = userEvent.setup();
        const {getInput, getOptions, getMessage} = renderCombobox({
            minLength: 3,
        });

        await user.click(getInput());
        await user.type(getInput(), 'ber');
        await waitFor(() => expect(getOptions()).toHaveLength(1));

        await user.keyboard('{Backspace}');
        await waitFor(() => expect(getOptions()).toHaveLength(0));
        expect(getMessage('belowMinLength')).not.toBeNull();
        expect(getMessage('noResults')).toBeNull();
    });

    test('MultiCombobox takes the same minLength prop', async () => {
        const user = userEvent.setup();
        const {getInput, getItemsMock, getMessage} = renderMultiCombobox({
            minLength: 2,
        });

        await user.click(getInput());
        await user.type(getInput(), 'b');
        await flush();
        expect(getItemsMock).not.toHaveBeenCalled();
        expect(getMessage('belowMinLength')).not.toBeNull();

        await user.type(getInput(), 'e');
        await waitFor(() => expect(getItemsMock).toHaveBeenCalledTimes(1));
    });
});
