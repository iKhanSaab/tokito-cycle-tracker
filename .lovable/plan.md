- Tokito UI Redesign Plan

### Summary

Restructure the app into a single Home view (with calendar integrated at top) and a Settings tab. Redesign the deep log as a collapsible card extension, overhaul the blood droplet animation, and simplify symptom inputs.

---

### Changes

**1. Navigation: Two tabs only (Home + Settings)**

- Bottom nav: Home (left) + Settings (right)
- Remove separate Calendar tab; calendar moves into Home screen at top

**2. Home Screen Restructure**

- **Calendar card at top**: Compact month calendar as a card/module at top of home. Only color dates that have logged data (no phase coloring on empty dates).
- **Remove morning/afternoon/evening tabs** entirely. One log per day, no snapshot type.
- **Today's card below calendar**: Shows "Mar 19 · Follicular" with an "Edit" button (instead of "Override" dropdown for phase).
- **Mood, Energy, Sleep sliders** remain in the today card.
- **Deep Log as collapsible extension**: Replace "+ Deep Log" button with a down-arrow (chevron) at bottom of the card. Tapping expands the card to reveal deep log questions inline. An up-arrow at the bottom of the expanded section collapses it back.

**3. Deep Log Changes**

- No longer a separate modal — it's an accordion-style extension of the today card.
- **Remove "How are you really feeling emotionally?"** (Q4 mood detailed) entirely.
- **Cramps**: Only visible when period mode is active.
- **Symptoms (bloating, headaches, body aches)**: Instead of separate yes/no questions, show three toggle pills ("Bloated", "Headaches", "Body Aches") in a row. Selecting a pill = active/true.
- Keep: spotting (when period off), flow heaviness (when period on), focus, sleep quality, stress, notes.

**4. Calendar Day Detail as Full-Screen Popup**

- Tapping a date in the calendar opens a full-screen overlay/popup card showing ALL details: phase info, mood, energy, sleep, AND full deep log (bloating, headaches, body aches, cramps, flow, stress, focus, sleep quality, notes).

**5. Blood Droplet Redesign**

- Move the droplet higher (above the bottom nav, roughly `bottom-20` instead of `bottom-6`) to avoid overlapping Settings icon.
- Change the dark red active color to a softer tone.
- When toggling period on: animate a droplet-shaped overlay that expands from the button to cover the whole screen with a light pink/rose tint (CSS animation, not the current plain overlay).
- The tint color stays light pink (not green — clarifying the user likely said "light of green" meaning "light of that thing"/pink).

**6. Store Changes**

- Remove `SnapshotType` dependency from `addLog`/`getLog` — simplify to one log per date.
- Remove `moodDetailed` from `DeepLog` interface.

---

### Files to Modify


| File                                       | Change                                                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/Index.tsx`                      | Two tabs (Home, Settings), remove Calendar tab                                                                                  |
| `src/components/home/HomeScreen.tsx`       | Integrate calendar at top, remove snapshot tabs, collapsible deep log, phase edit button                                        |
| `src/components/home/DeepLogModal.tsx`     | Convert to inline collapsible `DeepLogSection`, remove mood detailed, toggle pills for symptoms, cramps only when period active |
| `src/components/calendar/CalendarView.tsx` | Refactor into compact card component for embedding; only color dates with data; day detail as full-screen popup with all fields |
| `src/components/home/BloodDroplet.tsx`     | Move higher, softer color, droplet expansion animation                                                                          |
| `src/store/useStore.ts`                    | Simplify log to one-per-date (remove snapshotType), remove moodDetailed                                                         |
| `src/index.css`                            | Update droplet-active color, add droplet expansion keyframes                                                                    |


### Technical Notes

- The collapsible deep log will use framer-motion `AnimatePresence` + `layout` for smooth expand/collapse within the card.
- The droplet screen-cover animation will use a CSS `@keyframes` that scales a circular clip-path from the droplet's position to fill the viewport.
- Calendar compact card will show a smaller grid (no weekday headers initially, or minimal) with scroll/swipe for months.

&nbsp;

at the personalize section that comes first, make  the age pills smaller so all come in one line, remove this totallY :  do you track your menstrual perod screen 