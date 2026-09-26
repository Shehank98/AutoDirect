Buttons in five variants: `primary` (harbour green), `accent` (vermilion — auction actions only), `secondary`, `ghost`, `danger`.

## Props

`variant`, `size` (`s` 36 / `m` 44 / `l` 52), `icon`, `iconRight`, `block`, `loading`, `href` (renders an `<a>`), plus native button props. No children = square icon button (give it `aria-label`).

## Usage

One primary per view. Use `accent` only for bidding / auction requests so vermilion keeps meaning "auction". Labels are verbs: "Request a quote", "Place proxy bid".
