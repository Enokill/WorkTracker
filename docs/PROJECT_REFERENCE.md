# PROJECT_REFERENCE.md — Daily Work Tracker

## App Overview

**Daily Work Tracker** is a premium mobile productivity app for workers paid per completed work unit (and optionally per carat weight). It functions as an interactive calendar + earnings dashboard, designed to feel like Google Calendar merged with a payroll tool.

- **Platform**: React Native + Expo (iOS & Android)
- **Version**: 1.2
- **Default Rate**: ₹2.75 per work unit
- **Carat Rate**: ₹100 per carat (optional, disabled by default)

---

## Folder Structure

```
app/
  _layout.tsx              Root layout — Alert, SafeArea, Theme, App providers + Stack
  (tabs)/
    _layout.tsx            Bottom tab navigator (Home, Report, Settings)
    index.tsx              Home screen — calendar + dashboard
    report.tsx             Monthly report screen — bar chart + entry log
    settings.tsx           Settings — themes, rates, feature flags, backup
  entry/
    [date].tsx             Work entry modal — log/edit units and carats

components/feature/
  MonthCalendar.tsx        Interactive monthly calendar with long-press context menu
  DashboardCards.tsx       5 dashboard cards (Week, Month, Selected Day, Advance, Payable)
  MonthlyBarChart.tsx      Scrollable horizontal bar chart for report screen

contexts/
  AppContext.tsx            Global app state — entries, settings, feature flags, computed earnings
  ThemeContext.tsx          Theme system — 8 themes × 2 modes (light/dark/auto)

hooks/
  useApp.ts                Consumer hook for AppContext

services/
  storage.ts               AsyncStorage CRUD — entries, settings, date colors, advance salary, backup/restore

constants/
  theme.ts                 Design tokens — Typography, Spacing, Radius, Shadow, Colors
  themes.ts                8 full color theme definitions (ThemeDef, ThemeColors interfaces)

assets/
  images/hero.png          Onboarding hero image

docs/
  PROJECT_REFERENCE.md     This file
  AI_HANDOVER.md           Handover guide for AI agents
  CHANGELOG.md             Complete change log
```

---

## Architecture

The app follows a **Data → Logic → UI** layered architecture:

| Layer | Location | Responsibility |
|---|---|---|
| Storage | `services/storage.ts` | Pure AsyncStorage CRUD, no React |
| State | `contexts/AppContext.tsx` | Global state, computed values, feature flags |
| Hook | `hooks/useApp.ts` | Context consumer with error boundary |
| UI | `components/feature/` | Pure rendering, consumes `useApp()` |
| Pages | `app/(tabs)/`, `app/entry/` | Navigation entry points |

**Provider stack** (`app/_layout.tsx`):
```
AlertProvider
  SafeAreaProvider
    ThemeProvider
      AppProvider
        AppStack (Stack navigator)
```

---

## Navigation

| Route | File | Description |
|---|---|---|
| `/(tabs)/` | `app/(tabs)/_layout.tsx` | Bottom tab container |
| `/(tabs)/` (index) | `app/(tabs)/index.tsx` | Home — calendar + dashboard |
| `/(tabs)/report` | `app/(tabs)/report.tsx` | Monthly report + bar chart |
| `/(tabs)/settings` | `app/(tabs)/settings.tsx` | Settings — themes, rates, backup |
| `/entry/[date]` | `app/entry/[date].tsx` | Work entry modal (date param) |

---

## Features

### Calendar
- Monthly view with swipe/button navigation
- Jump to any month/year via month picker modal
- Today highlighted with border ring
- Selected date highlighted with primary color fill
- Dates with work entries show a colored dot (units = accent, carats = accentMid)
- Sunday dates shown in red by default
- Long-press (600ms) opens context menu: Make Red / Reset / Cancel
- Custom date colors persisted to AsyncStorage

### Dashboard Cards
1. **Week Total** — Sun–Sat units × rate (+ carats if enabled)
2. **Month Total** — current month units × rate (+ carats if enabled)
3. **Selected Day** — units + carats for selected calendar date
4. **Advance Salary** — editable per-month advance amount (tap to edit inline)
5. **Payable Income** — Month Earnings − Advance Salary (turns red if negative)

### Work Entry
- Date auto-filled from calendar selection
- Work Count (integer, required)
- Carat Weight (decimal, optional — only shown when `caratEnabled = true`)
- Notes (optional)
- Real-time earnings preview as you type
- Save, Update, Delete operations

### Monthly Report
- Month navigation (prev/next)
- Total earnings banner with breakdown
- 4 stat cards: Total Units, Daily Avg, Best Day, Month Carats (if enabled)
- Scrollable horizontal bar chart with per-day counts
- Color-coded bars: best day = accent, Sunday = error, selected = primaryDark
- Earnings tooltip on selected bar
- Sortable entry log (newest first) with best day highlight

### Settings
- **Appearance**: 8 color themes × Light/Dark/Auto mode
- **Features**: Enable/Disable Carat Rate toggle
- **Profile**: Username (shown in greeting header)
- **Work Rate**: ₹/unit (editable)
- **Carat Rate**: ₹/carat (editable, only shown when carat enabled)
- **Data Backup**: Export JSON via Share sheet, Restore by pasting JSON

---

## Business Logic & Calculations

### Earnings Formula
```
Unit Earnings     = workCount × ratePerUnit
Carat Earnings    = caratWeight × caratRate   (only if caratEnabled = true)
Day Earnings      = Unit Earnings + Carat Earnings
Month Earnings    = Σ(all day earnings in current month)
Week Earnings     = Σ(all day earnings in current Sun–Sat week)
Payable Income    = Month Earnings − Advance Salary
```

### Week Calculation
Week = Sunday to Saturday of the current week (using `getWeekDates()` in `services/storage.ts`).

### Month Key Format
`YYYY-MM` — used as prefix for filtering entries and as AsyncStorage key suffix for advance salary.

### Date Format
`YYYY-MM-DD` — used as primary key for all work entries.

---

## Database / Storage (AsyncStorage)

| Key | Type | Description |
|---|---|---|
| `work_entries` | `WorkEntry[]` | All work entries (JSON array) |
| `app_settings` | `AppSettings` | User settings (rate, caratRate, caratEnabled, username) |
| `date_colors` | `CustomDateColor` | Custom date colors map |
| `advance_salary_YYYY-MM` | `number` | Advance per month |
| `app_theme_prefs` | `{themeId, mode}` | Theme preferences |

---

## Theme System

### 8 Themes
| ID | Name | Primary Feel |
|---|---|---|
| `ocean` | Ocean Blue | Deep blue, teal accent |
| `forest` | Forest | Deep green, amber accent |
| `sunset` | Sunset | Orange-red, purple accent |
| `lavender` | Lavender | Purple, cyan accent |
| `rose` | Rose | Red-pink, amber accent |
| `charcoal` | Charcoal | Gray, emerald accent |
| `teal` | Teal | Teal-cyan, amber accent |
| `crimson` | Crimson | Deep red, blue accent |

Each theme has a `light` and `dark` variant with full color tokens. Mode can be `light`, `dark`, or `auto` (device system preference).

### Color Token Interface (`ThemeColors`)
Key tokens: `primary`, `primaryDark`, `primaryMid`, `primaryLight`, `accent`, `accentMid`, `accentLight`, `secondary`, `surface`, `background`, `onSurface`, `onSurfaceSubtle`, `gradientPrimaryStart`, `gradientPrimaryEnd`, etc.

---

## Feature Flags

| Flag | Location | Default | Effect |
|---|---|---|---|
| `caratEnabled` | `AppSettings.caratEnabled` | `false` | Shows/hides all carat UI, includes/excludes carats from all calculations |

When `caratEnabled = false`:
- Carat input fields hidden in entry screen
- Carat dots hidden on calendar
- Carat stat cards hidden in report
- Carat chips hidden in dashboard
- Carat rate settings hidden
- All earnings calculated from units only
- Stored carat data preserved (not deleted)

---

## Dependencies

| Package | Purpose |
|---|---|
| `expo-router` | File-based navigation |
| `expo-linear-gradient` | Gradient header and cards |
| `expo-image` | Optimized image rendering |
| `expo-status-bar` | Status bar control |
| `@expo/vector-icons` | MaterialIcons throughout |
| `react-native-safe-area-context` | Safe area insets |
| `@react-native-async-storage/async-storage` | Local persistence |
| `react-native-paper` | (available, not currently used) |
| `react-native-reanimated` | Animated scale on calendar day cells |

---

## Build Instructions

### Development
```bash
npx expo start
```

### Android APK (EAS Build)
1. Ensure `eas.json` uses `npmClient: "npm"` (already configured)
2. Push to GitHub
3. Run: `eas build --platform android --profile preview`
4. Or use OnSpace → Download → Download Android APK

### Profile Recommendations
- `preview` → direct `.apk` for sideloading
- `production` → `.aab` for Google Play Store

---

## Future Improvements

1. Cloud sync via OnSpace Cloud / Supabase
2. Weekly/annual report view
3. PDF export of monthly reports
4. Push notification reminders for daily entry
5. Multiple work rate categories (different rates per task type)
6. Goal setting with monthly unit target and progress ring
7. Carat weight bar chart in Report screen
8. Overtime detection and alert
