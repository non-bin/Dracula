# [Changelog](https://github.com/non-bin/Dracula/blob/main/CHANGELOG.md)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## ToDo

- Other trigger methods
  - Phase change or full reset of another counter
    - Hidden counters
  - Separate trigger button
    - Incriment/undo/reset specific counter
    - Next/prev phase
- Let counter phase set
  - Layout
  - Config of other counters
- Undo
- Other function blocks
  - Timer
  - Dummy (spacer, text, title)
- Sounds
- Trigger fullscreen colour from counter phase
- Display the number of times a counter has reset
- Editor
  - Save/share
- Mobile interface
  - Tap to increment
  - Hold to open popup
- Keyboard shortcut reference popup (responsive to config)

## 1.0.0-alpha [Unreleased]

### Fixed

### Added

- Editor

### Changed

- New URL is <https://dracula.jacka.net.au>
- Grid template is now generated from parameters in the config instead of baked as a string

### Removed

### Internal

- devServer.sh is now executable
- Refactored main.js, extracting logic to new index.js and editor.js files
- Refactor imports to use wildcard and default exports
- Rename `History` to `HistoryManager` so it doesn't conflict with `window.history`
- Rename `main.js` to `screen.js` and turn it into a class
- Refactor common code from `index.js` and `editor.js` into `screen.js`

## [0.0.3] - 2024-10-20

### Fixed

- Add .editorconfig, .prettierrc, and eslint.config.mjs for code consistency
- Counters now reset to 0 when they reach their max, so you can see what comes next

### Added

- Terribly drawn favicon
- devServer.sh

### Changed

- Refactored to use ES6 modules, and classes
- Better counter positioning, by giving location and size
- Refactor logging to a separate utility function

## [0.0.2] - 2024-10-20

### Fixed

- Counter display now fills the screen
- Colour brightness contrast accessability

### Added

- ESLint config
- Grid template options
- Colour options
- Auto fullscreen on phones and tablets
- Footer with version and author info

### Changed

- Separated config for counter ID, and display name
- Moved interface source to `/interface/` to make room for future pcb design files

## [0.0.1] - 2024-05-25

### Added

- Basic functionality
- 2 row, 2 column layout
- Plain JSON config

[unreleased]: https://github.com/non-bin/Dracula/tree/dev
[0.0.3]: https://github.com/non-bin/Dracula/releases/tag/v0.0.3
[0.0.2]: https://github.com/non-bin/Dracula/releases/tag/v0.0.2
[0.0.1]: https://github.com/non-bin/Dracula/releases/tag/v0.0.1
