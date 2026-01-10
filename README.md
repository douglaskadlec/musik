# Musik

**Musik** is a lightweight, dependency-free web component for building customizable audio playlists using the native HTML Audio API.

It is framework-agnostic, styleable via CSS design tokens, and safe to embed on static sites.

---

## Features

* Custom Element `<musik-app>`
* Works with plain HTML, no framework required
* Zero dependencies
* Shadow DOM encapsulation
* CSS custom property–based theming
* Keyboard-accessible playback controls
* Config validation with clear error reporting

---

## Basic Usage

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<script src="https://cdn.jsdelivr.net/npm/@douglaskadlec/musik@1.0.0/musik.js" defer></script>
	</head>
	<body>
		<musik-app config="config.json"></musik-app>
	</body>
</html>
```

The `config` attribute must point to a JSON file accessible by the browser. The component fetches and validates this file at runtime.

---

## Configuration

### Config object

```ts
interface Config {
	style?: Style
	tracks: Track[]
}

interface Style {
	[key: string]: string
}

interface Track {
	artist: string
	title: string
	artwork: string
	audio: string
	duration: string
}
```

Example:

```json
{
	"style": {
		"color-text-primary": "#ccc",
		"color-accent-primary": "goldenrod",
		"radius-base": "0.5em"
	},
	"tracks": [
		{
			"artist": "Artist Name",
			"title": "Track Title",
			"artwork": "/artwork.jpg",
			"audio": "/audio.mp3",
			"duration": "3:42"
		}
	]
}
```

Notes:

* `style` object is optional and generally unnecessary, as styling is intended to be handled via design tokens (see below).
* `tracks` array is required.
* At least one track is required.
* All track properties (artist, title, artwork, audio, and duration) are required.
* `duration` is not calculated; it is display-only.
* All values must be strings.

---

## Design Tokens

Musik exposes the following CSS custom properties:

### Layout

```css
--musik-layout-grid-template-columns
--musik-layout-column-gap
--musik-layout-row-gap
```

### Spacing

```css
--musik-space-100
--musik-space-200
--musik-space-300
```

### Color

```css
--musik-color-text-primary
--musik-color-text-secondary
--musik-color-text-tertiary
--musik-color-accent-primary
--musik-color-accent-secondary
--musik-color-accent-tertiary
```

### Typography

```css
--musik-font-family-primary
--musik-font-family-secondary
--musik-font-family-tertiary
--musik-font-size-primary
--musik-font-size-secondary
--musik-font-size-tertiary
--musik-font-weight-primary
--musik-font-weight-secondary
--musik-font-weight-tertiary
```

### Motion

```css
--musik-motion-duration-base
--musik-motion-easing-standard
```

### Media

```css
--musik-media-aspect-ratio
--musik-media-object-fit
```

### Shape

```css
--musik-radius-base
```

### Components

```css
--musik-component-progress-height
--musik-component-icon-size
```

Example:

```css
musik-app {
	--musik-color-text-primary: #ccc;
	--musik-color-text-secondary: #aaa;
	--musik-color-accent-primary: goldenrod;
	--musik-color-accent-secondary: darkgoldenrod;
	--musik-media-object-fit: contain;
	--musik-radius-base: 0.5em;
}
```

All tokens have safe defaults; overriding is optional.

---

## Accessibility

Musik includes basic accessibility features by default:

* Keyboard-focusable progress bar (`role="slider"`)
* Arrow, Home, End, and Space key support
* ARIA value updates during playback
* Native `<button>` elements for track selection

Focus styles respect `:focus-visible`.

---

## Browser Support

Musik targets modern evergreen browsers with:

* Custom Elements
* Shadow DOM
* CSS Container Queries
* ES2019+

No polyfills are included.

---

## Example

A live implementation of Musik can be seen at:

https://mix.colorghost.xyz

---

## License

ISC © Douglas Kadlec

---