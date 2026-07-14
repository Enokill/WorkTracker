# AI_HANDOVER.md — Daily Work Tracker

## Current Version
**v1.2 — UpdateV1**

## Repository Name
Current project repository (UpdateV1 branch)

---

## Implemented Features

### Core
- [x] Interactive monthly calendar (swipe navigation, month/year picker, today highlight, selected date)
- [x] Work entry per date (work count, optional carat weight, notes)
- [x] 5 dashboard cards (Week Total, Month Total, Selected Day, Advance Salary, Payable Income)
- [x] Monthly report screen with horizontal scrollable bar chart
- [x] Entry log (sorted newest first, best day highlighted)
- [x] Long-press calendar date → context menu (Make Red / Reset / Cancel)
- [x] Custom date colors persisted to storage
- [x] Local data backup / restore (JSON export via Share sheet)

### Settings & Personalization
- [x] Username (shown in greeting header as "Good morning, [name] 👋")
- [x] Work rate setting (₹/unit, default ₹2.75)
- [x] Carat rate setting (₹/carat, default ₹100, hidden when carat disabled)
- [x] 8 color themes with light/dark/auto mode
- [x] Theme preferences persisted to AsyncStorage

### Feature Flags
- [x] **Enable Carat Rate** toggle (OFF by default for new installs)
  - When OFF: All carat UI hidden, earnings from units only, stored carat data preserved
  - When ON: Full carat tracking restored instantly

---

## Pending Features

- [ ] Cloud sync (OnSpace Cloud / Supabase integration)
- [ ] PDF/CSV export of monthly reports
- [ ] Annual report / yearly view
- [ ] Monthly goal setting with progress ring on home screen
- [ ] Carat weight bar chart in Report screen (separate from units chart)
- [ ] Push notification reminders
- [ ] Multiple rate categories
- [ ] Week comparison cards

---

## Known Bugs / Limitations

1. **Hermes/Android Intl**: `toLocaleDateString()` with locale options not supported on Android Hermes — fixed by using static `WEEKDAYS` / `MONTHS` arrays throughout. Do NOT use `Intl` locale APIs.
2. **Advance Salary**: Only persists for the current month. Switching months requires re-entering advance. This is by design (advance is per month).
3. **Backup Restore**: Restores all data including settings. If user pastes partial JSON, restore will fail with an alert.
4. **No offline indicator**: App assumes device storage is always available.

---

## Coding Standards

### Language & Types
- TypeScript strict, all props must have interfaces
- No `any` types except in MaterialIcons name casting (`as any`)
- Named exports only, no default anonymous components

### React Native Specifics
- **NEVER** use `toLocaleDateString()` or Intl locale options — use static arrays instead
- **NEVER** use `useWindowDimensions()` — use `Dimensions.get('window')` in useEffect
- **NEVER** use React Native's `Image` — always use `expo-image`
- Use `Pressable` with `hitSlop` for all interactive elements (min 44×44 touch target)
- Conditional rendering: use `{condition ? <C /> : null}`, never `{condition && <C />}`
- Styles at file bottom via `StyleSheet.create()`, never inline objects in render

### Architecture Rules
- Components import from `hooks/` only, never directly from `contexts/`
- Services must be pure functions (no React imports)
- Contexts hold state only, hooks are thin consumers
- Pages = entry points only, no business logic in `app/`

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Component | PascalCase | `DashboardCards`, `MonthCalendar` |
| Hook | camelCase with `use` prefix | `useApp`, `useTheme` |
| Context | PascalCase + `Context` | `AppContext`, `ThemeContext` |
| Provider | PascalCase + `Provider` | `AppProvider`, `ThemeProvider` |
| Service function | camelCase verb-first | `getAllEntries`, `saveEntry` |
| Interface | PascalCase | `WorkEntry`, `AppSettings` |
| Constants | SCREAMING_SNAKE for true constants | `MONTH_NAMES`, `DAY_NAMES` |
| Theme colors | camelCase tokens | `gradientPrimaryStart`, `onSurfaceSubtle` |

---

## Theme Guidelines

- Access colors via `const { colors } = useTheme()` — never import `Colors` from `constants/theme.ts` in components
- `constants/theme.ts` tokens (Typography, Spacing, Radius, Shadow) are static — safe to import anywhere
- All 8 themes must maintain readable contrast ratios (text ≥ 4.5:1 against surface)
- Gradient colors must use `colors.gradientPrimaryStart` / `colors.gradientPrimaryEnd`
- Carat-related accents use `colors.accent` / `colors.accentLight` / `colors.accentMid`
- Warning (advance salary) uses `colors.warning` / `colors.warningLight` / `colors.warningMid`

---

## Critical Files (Never Delete)

| File | Why Critical |
|---|---|
| `app/_layout.tsx` | Root layout — removing AlertProvider breaks all alerts |
| `contexts/AppContext.tsx` | All app state — breaking this crashes everything |
| `contexts/ThemeContext.tsx` | All themes — breaking this causes visual crashes |
| `services/storage.ts` | All data persistence — breaking this loses user data |
| `constants/themes.ts` | 8 theme definitions — required by ThemeContext |
| `constants/theme.ts` | Design tokens — used by every component |

---

## Safe Files to Edit

| File | Safe Operations |
|---|---|
| `app/(tabs)/index.tsx` | UI layout, greeting, selected date bar |
| `app/(tabs)/settings.tsx` | Add settings rows, feature toggles |
| `app/(tabs)/report.tsx` | Add charts, stats, entry log columns |
| `app/entry/[date].tsx` | Add entry fields (within caratEnabled guard) |
| `components/feature/MonthCalendar.tsx` | Calendar cell styles, legend |
| `components/feature/DashboardCards.tsx` | Card layouts, new card types |
| `components/feature/MonthlyBarChart.tsx` | Bar styles, tooltip |
| `docs/` | Documentation only |

---

## Development Workflow

1. Read relevant files before making changes (use `read_file`)
2. Plan all changes, then execute in parallel where possible
3. Always verify `caratEnabled` guards when touching carat UI
4. Always use `colors.xxx` from `useTheme()` — no hardcoded hex in components
5. Run through every screen mentally after changes — check light + dark mode

---

## Testing Checklist

Before marking a feature complete:

- [ ] Home screen loads without crash
- [ ] Calendar navigates correctly prev/next month
- [ ] Tapping a date updates Selected Day card
- [ ] Long press opens context menu
- [ ] Tapping a date → entry screen opens, saves, returns
- [ ] Dashboard cards update after save
- [ ] Report screen shows correct month data
- [ ] Bar chart renders without crash for months with no entries
- [ ] Settings: rate save works and reflects everywhere
- [ ] Settings: username updates greeting
- [ ] Settings: theme switch applies to all screens
- [ ] Settings: dark/light/auto mode works
- [ ] Settings: carat toggle ON → carat UI appears
- [ ] Settings: carat toggle OFF → carat UI disappears, existing data preserved
- [ ] Backup export shows share sheet
- [ ] Backup restore with valid JSON works
- [ ] Backup restore with invalid JSON shows error alert
- [ ] Advance salary tap-to-edit works, persists
- [ ] Payable income = month earnings − advance
- [ ] No layout overflow on small screens (320px width)

---

## AlertProvider Requirement

**CRITICAL**: `AlertProvider` from `@/template` MUST be the outermost wrapper in `app/_layout.tsx`. Never remove it. All screens use `useAlert()` from this provider.

```tsx
import { AlertProvider } from '@/template';
// Always: <AlertProvider> wraps everything
```
