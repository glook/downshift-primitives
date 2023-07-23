// Created by: Andrey Polyakov (andrey@polyakov.im)

import {BaseSyntheticEvent} from 'react';

export const preventDownshiftDefault = (event: BaseSyntheticEvent<any>) => {
    event.nativeEvent.preventDownshiftDefault = true;
};

export const objectFilterUndefinedValues = <T extends Record<string, any>>(
    obj: T,
): T => {
    const newObj = {} as T;
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    }
    return newObj;
};
