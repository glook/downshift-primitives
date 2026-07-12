// Created by: Andrey Polyakov (andrey@polyakov.im)

import type {Preview} from '@storybook/react';

const preview: Preview = {
    parameters: {
        controls: {expanded: true},
        options: {
            storySort: {
                order: ['Combobox', 'MultiCombobox', 'Select'],
            },
        },
    },
};

export default preview;
