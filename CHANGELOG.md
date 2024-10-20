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
- Swap layout depending on counter phase
- Undo
- Other function blocks
  - Timer
  - Dummy (spacer, text, title)
- Sounds
- Trigger fullscreen colour from counter phase
- Display the number of times a counter has reset
- Editor
  - Save/share
- Mobile demo interface (tap screen, left to undo)

## 1.0.0-alpha [Unreleased]

### Fixed

### Added

### Changed

### Removed

## [0.0.3] - 2024-10-20

### Fixed

- Add .editorconfig, .prettierrc, and eslint.config.mjs for code consistency
- Counters now reset to 0 when they reach their max, so you can see what comes next

### Added

- Terribly drawn favicon

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
