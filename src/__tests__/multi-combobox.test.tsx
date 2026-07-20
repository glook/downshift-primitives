// Created by: Andrey Polyakov (andrey@polyakov.im)

import {waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, test} from 'vitest';

import {renderMultiCombobox} from './fixtures';

describe('DownshiftMultiCombobox (smoke)', () => {
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
});
