# CHANGELOG.md — Daily Work Tracker

---

## [1.2.0] — UpdateV1 — 2026

### Added
- **Enable Carat Rate feature flag** (`caratEnabled` in `AppSettings`)
  - New toggle in Settings → Features section
  - Default: OFF for new installations
  - Existing users retain their previously saved preference via settings merge
  - When OFF: all carat UI hidden globally (inputs, dashboard, calendar dots, report stats, chart legends, badges)
  - When ON: full carat tracking restored without app restart
  - Stored carat data is preserved when toggled OFF — not deleted
  - Informational note shown in Settings when carat is enabled
- **Carat rate setting** now conditionally rendered — only visible when `caratEnabled = true`
- **Stats strip** in Settings now conditionally shows "Carats" column when enabled
- **Profile subtitle** in Settings header now conditionally shows `/ct` rate when enabled
- `/docs` folder with three documentation files:
  - `PROJECT_REFERENCE.md` — full project reference
  - `AI_HANDOVER.md` — AI agent handover guide and development standards
  - `CHANGELOG.md` — this file

### Changed
- **`AppContext.tsx`**: `weekEarnings` and `monthEarnings` now conditionally include carat earnings based on `caratEnabled` flag
- **`AppContext.tsx`**: exposed `caratEnabled` boolean as a top-level context value
- **`services/storage.ts`**: `getSettings()` now merges stored settings with `DEFAULT_SETTINGS` so new fields (`caratEnabled`) appear correctly for existing users without clearing their data
- **`services/storage.ts`**: default settings now include `caratEnabled: false`
- **`services/storage.ts`**: `exportBackup()` now uses `Promise.all` for parallel reads (performance)
- **`components/feature/DashboardCards.tsx`**: all carat secondary display (`+ X ct`) gated by `caratEnabled`
- **`components/feature/MonthCalendar.tsx`**: carat dot in day cell now gated by `showCaratDot` prop derived from `caratEnabled`
- **`app/entry/[date].tsx`**: Carat Weight entry block only rendered when `caratEnabled = true`; carat value excluded from save payload when disabled
- **`app/(tabs)/settings.tsx`**: Carat Rate settings section conditionally rendered; `caratEnabled` stats hidden when OFF
- **`app/(tabs)/report.tsx`**: carat stat card, carat earnings banner chip, carat entry log badges all gated by `caratEnabled`
- **`app/(tabs)/index.tsx`**: rate chip in header conditionally shows carat rate; selected date bar carat badge conditional

### Fixed
- **Layout**: Removed `marginRight` from last item in stat card rows (was causing overflow on small screens)
- **Layout**: Added `flexShrink: 0` to fixed-width elements in flex rows (avatar, icons, earnings amounts) to prevent unexpected compression
- **Layout**: `selectedBar` in Home screen — `selectedDateInfo` now has `flex: 1` to prevent overflow
- **Layout**: `rateChip` in Home header now has `flexShrink: 1` and `marginRight` to prevent overflow when carat rate is shown
- **Settings**: Mode buttons now use explicit `marginRight` on non-last buttons instead of `flex` gap (avoids layout issues on Android)
- **Report**: Month nav now uses `justifyContent: 'space-between'` with `paddingHorizontal` for cleaner layout
- **Report**: Stat row second card now has no trailing marginRight (was adding unnecessary right padding)
- **Entry screen**: `backgroundColor` moved to `KeyboardAvoidingView` instead of `ScrollView` to prevent white flash on keyboard open
- **Code**: Removed unused `Switch` import from `app/entry/[date].tsx` (was imported but not used)
- **Code**: Removed unused `useRef` import from `app/(tabs)/settings.tsx`
- **Code**: Removed unused `weekTotal` destructure from report screen

### Preserved
- All existing work entries, settings, date colors, advance salary data
- All 8 color themes with light/dark/auto mode
- All dashboard calculations and formulas
- All calendar features (long-press, custom colors, month picker, animation)
- All backup/restore functionality
- Username + greeting system
- Navigation structure (3 tabs + entry modal)

---

## [1.1.0] — Previous Version

### Added
- Carat weight as second entry type (per-date)
- Carat Rate setting (₹/carat)
- 8 color themes with Light/Dark/Auto mode switching
- Username display in home header with avatar initials
- Local backup and restore (JSON via Share sheet)
- Settings: profile card, stats strip, backup/restore section

### Changed
- Home screen: gradient header with personalized greeting
- Dashboard cards: LinearGradient tiles with large numeric typography
- Calendar: polished selected date animation, carat dot indicator
- All components: migrated from static `Colors` to dynamic `useTheme()` colors

---

## [1.0.0] — Initial Release

### Added
- Monthly calendar view with swipe navigation
- Today highlight, selected date highlight
- Sunday dates in red
- Long-press to set custom date colors (red/default)
- Work entry per date: count + notes
- 5 dashboard cards: Week Total, Month Total, Selected Day, Advance Salary, Payable Income
- Settings: work rate (₹/unit), default ₹2.75
- Monthly report screen with scrollable bar chart
- Stat cards: Total Units, Daily Avg, Best Day
- Entry log (sorted newest first)
- Local AsyncStorage persistence
- Material 3 design system with rounded cards and soft shadows
