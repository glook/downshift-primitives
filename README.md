# @glook/downshift-primitives

Headless compound components for combobox, multi-combobox and select, built on [downshift](https://github.com/downshift-js/downshift).

No styles, no markup opinions. Every part is a slot you render yourself; state is exposed through `data-*` attributes. Async loading, cursor pagination, debounced filtering and floating positioning are handled for you.

```bash
npm install @glook/downshift-primitives
```

Peer deps: `react` / `react-dom` `^16.14 || ^17 || ^18 || ^19` — every major is run in CI.

## Usage

```tsx
import {Arrow, Combobox, Input, Listbox, ListBoxItems, Option, OptionState, SelectedItem, Trigger} from '@glook/downshift-primitives';

<Combobox<City, number>
    getItems={getCities}
    itemToString={(city) => city?.name ?? ''}
    renderSelectedItem={(city) => <span>{city.name}</span>}
    debounceTime={300}
>
    <Trigger asChild>
        <span className="trigger">
            <Input asChild placeholder="Start typing a city">
                <input className="input" />
            </Input>
            <SelectedItem className="selectedItem" />
            <Arrow className="arrow">▾</Arrow>
        </span>
    </Trigger>

    <Listbox asChild>
        <ul className="listbox">
            <ListBoxItems<City> getOptionValue={(city) => city.id}>
                {({values}) => (
                    <>
                        {values.map(({rawValue}, index) => (
                            <Option asChild key={rawValue.id} rawValue={rawValue} index={index}>
                                <li className="option">{rawValue.name}</li>
                            </Option>
                        ))}
                        <OptionState type="loading" asChild>
                            <li>Loading…</li>
                        </OptionState>
                        <OptionState type="noResults" asChild>
                            <li>Nothing found</li>
                        </OptionState>
                    </>
                )}
            </ListBoxItems>
        </ul>
    </Listbox>
</Combobox>;
```

Every component is exported twice — namespaced (`DownshiftCombobox`) and short (`Combobox`). Pick one and stay consistent.

## Loading items

All three roots take a single `getItems` function. It is called on open, on filter change and on scroll to the bottom:

```ts
const getCities: DownshiftGetItemsFn<City, number> = async ({filterText, signal}, cursor) => {
    const page = cursor ?? 0;
    const res = await fetch(`/cities?q=${filterText ?? ''}&page=${page}`, {signal});
    const items = await res.json();

    // returning a cursor enables infinite scroll; omit it to signal the last page
    return {items, cursor: items.length ? page + 1 : undefined};
};
```

Items are cleared when the menu closes and re-fetched on open. In-flight requests are aborted through `signal`.

### `minLength`

`Combobox` and `MultiCombobox` accept `minLength`: while the (debounced) filter text is shorter, `getItems` is not called, the list stays empty and `loadingState` is `idle`. The menu still opens, so use `<OptionState type="belowMinLength">` for the hint - `noResults` is hidden below the threshold because no search happened.

```tsx
<Combobox getItems={getCities} minLength={3} …>
    …
    <OptionState type="belowMinLength">Type at least 3 characters</OptionState>
    <OptionState type="noResults">Nothing found</OptionState>
</Combobox>
```

## Roots

| Root | Selection | Required props |
| --- | --- | --- |
| `Combobox` | single, with text input | `getItems`, `itemToString`, `renderSelectedItem` |
| `MultiCombobox` | multiple, with chips | `getItems`, `getOptionValue`, `renderSelectedItem`, `selectedItems`, `onChange` |
| `Select` | single, no text input | `getItems`, `renderSelectedItem` |

`MultiCombobox` is controlled: it holds no selection of its own. Selected items are hidden from the list, compared by `getOptionValue`.

Anything else from downshift's `useCombobox` / `useSelect` (`onSelectedItemChange`, `stateReducer`, …) is passed straight through.

## Parts

`Trigger`, `Input`, `Label`, `Listbox`, `ListBoxItems`, `Option`, `OptionState`, `SelectedItem`, `SelectedItems`, `Chip`, `ChipRemove`, `Clear`, `Arrow`, `LoadingIndicator`.

Parts that read the root: `Trigger`, `Clear` and `SelectedItem` render the right variant automatically. Parts that do not apply render nothing — `Input` inside a `Select`, `Placeholder` inside a `Combobox`.

`OptionState` takes `type: 'loading' | 'loadingMore' | 'noResults' | 'error' | 'belowMinLength'` and decides on its own whether to show.

Most parts accept `asChild` and merge their props into your element, so you keep full control of the markup.

### Portal

`Listbox` can render its element outside the trigger's tree - useful inside dialogs or any ancestor with `overflow: hidden` / `transform`:

```tsx
<Listbox portal={true}>…</Listbox>            // into document.body
<Listbox portal={dialogElement}>…</Listbox>   // into a specific element
```

The decision is made on the first render and the container must already exist: pass an element, not `null`, and let whoever owns the container (a modal wrapper, for example) render the combobox only once the node is available. Positioning keeps working through `useDropdownMenuFloating`; `z-index` and the rest of the styling stay yours. The portal is client-only - during server rendering a portaled `Listbox` renders nothing, and SSR is not otherwise tested.

## Styling

There is no CSS. Hook onto the data attributes:

`data-is-open`, `data-is-loading`, `data-loading-state`, `data-is-selected`, `data-is-active`, `data-is-disabled`, `data-is-hovered`, `data-is-focused`, `data-has-item`, `data-has-no-items`, `data-has-error`, `data-has-selected-item`, `data-has-input-value`.

```css
.option[data-is-active] { background: #eee; }
.option[data-is-selected] { font-weight: 600; }
```

The listbox is positioned with floating-ui and exposes `--list-box-reference-width` and `--list-box-available-height` as CSS variables. Tune it with `dropdownMenuFloatingOptions`:

```tsx
<Combobox dropdownMenuFloatingOptions={{placement: 'bottom-start', offset: 5, applyWidth: true}} />
```

`applyWidth` (default `true`) also hard-sets the listbox `width` / `maxWidth` from the trigger.

## Development

```bash
npm run storybook   # component catalogue, the only way to run things by hand
npm run build       # dist/index.{js,cjs,d.ts}
npm run typecheck
npm test            # vitest + jsdom
```

Testing against another major locally mirrors the CI matrix, for example:

```bash
npm install --no-save react@17 react-dom@17 @types/react@17 @types/react-dom@17 @testing-library/react@12
npm ci              # back to the React 18 dev stack
```

## License

MIT © Andrey Polyakov
