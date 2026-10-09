# Accessible Tabs Component

A reusable, dependency-free tab system built with semantic HTML, CSS and vanilla JavaScript.

## Files
- `index.html` – demo page with two independent tab instances
- `css/tabs.css` – styles for default, hover, active, focus states, animation, responsive and no-JS fallback
- `js/tabs.js` – `Tabs` class (DOM manipulation, events, ARIA state, error handling)

## How to run
Unzip and open `index.html` in any browser. No build step or server needed.

## How to use in your own page
1. Include `css/tabs.css` and `js/tabs.js`.
2. Add `data-tabs` to a container with a `role="tablist"` of `role="tab"` buttons, each with `aria-controls` pointing to a `role="tabpanel"` (see `index.html`). Hide all panels except the first with `hidden`.
3. Optional attributes on the container:
   - `data-default-index="1"` – start on a different tab
   - `data-hash` – sync the active tab with the URL hash (refresh/share keeps the tab)
   - `data-orientation="vertical"` – vertical tab list (Up/Down arrows)
   - Add `aria-disabled="true"` to any tab button to disable it
4. API: `el.tabsInstance.select(2)`; listen for the `tabs:change` event (`event.detail` = `{index, tab, panel}`).

## Features
- **Accessibility:** ARIA tablist/tab/tabpanel roles, `aria-selected`, `aria-controls`, `aria-labelledby`, roving `tabindex`, visible focus outlines, focusable panels, `prefers-reduced-motion` support.
- **Keyboard:** Tab enters the tab list; Left/Right (Up/Down if vertical) move and wrap; Home/End jump to first/last; disabled tabs are skipped.
- **Responsive:** tab list scrolls horizontally and tabs stretch on screens under 480px.
- **Animation:** fade/slide on panel change via CSS keyframes.
- **Error handling:** malformed markup logs a clear console message and marks that instance with `.tabs--error` without breaking others.
- **Fallbacks:** without JavaScript (or in browsers lacking `classList`/`querySelector`) all panels display stacked and tab buttons are hidden; CSS colours have non-variable values for old browsers.

## Test checklist
1. Click each tab – only that panel shows; the "Last event" line updates.
2. Press Tab to focus the tab list, then use Left/Right/Home/End.
3. Resize below 480px – layout adapts.
4. Disable JavaScript – all content is still readable.
5. Enable "Reduce motion" in your OS – animations stop.
6. Click "Features" in the first demo, refresh the page – the tab stays selected. Try the disabled "Coming soon" tab.
7. Test with a screen reader (NVDA/VoiceOver): roles and selected state are announced.
