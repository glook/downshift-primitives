// Created by: Andrey Polyakov (andrey@polyakov.im)

import {fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, test, vi} from 'vitest';

import {renderSelect} from './fixtures';

const OPTION_HEIGHT = 40;

/**
 * jsdom has no layout: fake a 40px-tall scroll box with 40px rows so
 * compute-scroll-into-view (downshift's default scrollIntoView) has geometry
 * to work with. offsetHeight must be non-zero, otherwise it forces scrollTop=0.
 */
const mockScrollBox = (listbox: HTMLElement, options: HTMLElement[]): void => {
    let scrollTop = 0;
    listbox.style.overflowY = 'auto';
    // parseInt('') on jsdom's empty computed border widths would give NaN
    listbox.style.borderWidth = '0px';
    Object.defineProperties(listbox, {
        clientHeight: {value: OPTION_HEIGHT, configurable: true},
        offsetHeight: {value: OPTION_HEIGHT, configurable: true},
        scrollHeight: {
            value: OPTION_HEIGHT * options.length,
            configurable: true,
        },
        scrollTop: {
            get: () => scrollTop,
            set: (value: number) => {
                scrollTop = value;
            },
            configurable: true,
        },
    });
    listbox.getBoundingClientRect = () =>
        ({
            top: 0,
            bottom: OPTION_HEIGHT,
            height: OPTION_HEIGHT,
            left: 0,
            right: 100,
            width: 100,
        }) as DOMRect;
    options.forEach((option, index) => {
        option.getBoundingClientRect = () => {
            const top = index * OPTION_HEIGHT - listbox.scrollTop;
            return {
                top,
                bottom: top + OPTION_HEIGHT,
                height: OPTION_HEIGHT,
                left: 0,
                right: 100,
                width: 100,
            } as DOMRect;
        };
    });
};

describe('Listbox portal', () => {
    afterEach(() => {
        document.querySelector('#portal-host')?.remove();
    });

    test('portal={true} renders the listbox into document.body once, without remounting', async () => {
        const user = userEvent.setup();
        const {container, getTrigger, getListbox, getOptions} = renderSelect({
            portal: true,
        });

        const listbox = getListbox();
        expect(listbox.parentElement).toBe(document.body);
        expect(container.contains(listbox)).toBe(false);

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));

        expect(getListbox()).toBe(listbox);
        expect(document.querySelectorAll('[role="listbox"]')).toHaveLength(1);
    });

    test('portal={element} renders the listbox into that element', async () => {
        const user = userEvent.setup();
        const host = document.body.appendChild(document.createElement('div'));
        host.id = 'portal-host';
        const {getTrigger, getListbox, getOptions} = renderSelect({
            portal: host,
        });

        expect(getListbox().parentElement).toBe(host);

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        expect(host.querySelectorAll('.ComboboxOption')).toHaveLength(5);
    });

    test('touch tap selects an option rendered through the portal', async () => {
        const user = userEvent.setup();
        const {getTrigger, getOptions, getSelectedItem} = renderSelect({
            portal: true,
        });

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));

        const berlin = getOptions().find(
            (option) => option.textContent === 'Berlin',
        )!;
        fireEvent.touchStart(berlin);
        fireEvent.touchEnd(berlin);
        fireEvent.click(berlin);

        await waitFor(() =>
            expect(getSelectedItem()).toHaveTextContent('Berlin'),
        );
    });

    test('keyboard highlight asks downshift to scroll the option inside the portaled menu', async () => {
        const user = userEvent.setup();
        const scrollIntoView = vi.fn();
        const {getTrigger, getListbox, getOptions} = renderSelect({
            portal: true,
            scrollIntoView,
        });

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        await user.keyboard('{ArrowDown}{ArrowDown}');

        expect(scrollIntoView).toHaveBeenLastCalledWith(
            getOptions()[1],
            getListbox(),
        );
        expect(getListbox().parentElement).toBe(document.body);
    });

    test('downshift scrolls the portaled menu on keyboard highlight but not on hover', async () => {
        const user = userEvent.setup();
        const {getTrigger, getListbox, getOptions} = renderSelect({
            portal: true,
        });

        await user.click(getTrigger());
        await waitFor(() => expect(getOptions().length).toBeGreaterThan(0));
        mockScrollBox(getListbox(), getOptions());

        await user.keyboard('{ArrowDown}');
        expect(getListbox().scrollTop).toBe(0);
        await user.keyboard('{ArrowDown}');
        expect(getListbox().scrollTop).toBe(OPTION_HEIGHT);

        fireEvent.mouseMove(getOptions()[4]);
        expect(getOptions()[4]).toHaveAttribute('data-is-active', 'true');
        expect(getListbox().scrollTop).toBe(OPTION_HEIGHT);
    });
});
