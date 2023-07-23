// Created by: Andrey Polyakov (andrey@polyakov.im)

import {useBaseDownshiftContext} from '../downshiftComboboxContext';

export const useIsDownshiftLoading = () => {
    const {loadingState} = useBaseDownshiftContext('DownshiftListBox');
    return ['loading', 'loadingMore', 'sorting', 'filtering'].includes(
        loadingState,
    );
};
