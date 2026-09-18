// @vitest-environment node
// Created by: Andrey Polyakov (andrey@polyakov.im)

import React from 'react';
import {renderToString} from 'react-dom/server';
import {describe, expect, test} from 'vitest';

import {Listbox} from '../downshift-listbox';
import {Select} from '../downshift-select';
import {Trigger} from '../downshift-trigger';
import type {ListboxPortal} from './fixtures';

const renderSelectMarkup = (portal?: ListboxPortal): string =>
    renderToString(
        <Select<string, void>
            getItems={() => ({items: []})}
            getOptionValue={(item) => item}
            renderSelectedItem={(item) => item}
        >
            <Trigger>Select</Trigger>
            <Listbox portal={portal}>
                <li>option</li>
            </Listbox>
        </Select>,
    );

describe('Listbox on the server', () => {
    test('inline listbox is part of the markup', () => {
        expect(renderSelectMarkup()).toContain('role="listbox"');
    });

    test('portal listbox renders nothing instead of touching document', () => {
        expect(renderSelectMarkup(true)).not.toContain('role="listbox"');
    });
});
