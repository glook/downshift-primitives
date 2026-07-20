// Created by: Andrey Polyakov (andrey@polyakov.im)

import {waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, test} from 'vitest';

import {renderSelect} from './fixtures';

describe('DownshiftSelect (smoke)', () => {
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
});
