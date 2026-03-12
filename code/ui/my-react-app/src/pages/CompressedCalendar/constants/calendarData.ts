import type { CalendarEvent } from '../interfaces'

let nextId = 1
function ev(
  title: string,
  day: number,
  startHour: number,
  endHour: number,
  color: string,
  icon: string,
): CalendarEvent {
  return { id: String(nextId++), title, day, startHour, endHour, color, icon }
}

export const WEEK_EVENTS: CalendarEvent[] = [
  // ── Monday (1) ──────────────────────────────────────────
  ev('Morning Run 🏃',                  1,  6.0,   7.0,  '#22d3ee', '🏃'),
  ev('Stand-up',                         1,  9.0,   9.25, '#818cf8', '🧍'),
  ev('Sprint Planning',                  1,  9.5,  11.0,  '#f472b6', '📋'),
  ev('Lunch w/ Marketing Team',          1, 12.0,  13.0,  '#fb923c', '🍔'),
  ev('1-on-1 with Manager',             1, 13.5,  14.0,  '#a78bfa', '🤝'),
  ev('Architecture Review',             1, 14.0,  15.5,  '#34d399', '🏗️'),
  ev('PR Reviews',                       1, 15.5,  16.5,  '#60a5fa', '👀'),
  ev('Azure DevOps Meetup Prep',         1, 17.0,  18.0,  '#fbbf24', '🎤'),
  ev('Dinner with Friends',             1, 19.0,  20.5,  '#f87171', '🍕'),

  // ── Tuesday (2) ─────────────────────────────────────────
  ev('Yoga',                             2,  6.5,   7.5,  '#86efac', '🧘'),
  ev('Stand-up',                         2,  9.0,   9.25, '#818cf8', '🧍'),
  ev('Feature Dev: Auth Module',         2,  9.5,  12.0,  '#60a5fa', '💻'),
  ev('Lunch & Learn: Bicep Templates',   2, 12.0,  13.0,  '#fbbf24', '📚'),
  ev('Pair Programming Session',         2, 13.0,  15.0,  '#f472b6', '👯'),
  ev('Coffee Chat w/ Intern',            2, 15.0,  15.5,  '#fb923c', '☕'),
  ev('CI/CD Pipeline Debugging',         2, 15.5,  17.0,  '#34d399', '🔧'),
  ev('Columbus Azure Meetup',            2, 18.0,  20.0,  '#818cf8', '☁️'),
  ev('Board Game Night',                 2, 20.5,  22.5,  '#f87171', '🎲'),

  // ── Wednesday (3) ───────────────────────────────────────
  ev('Morning Run 🏃',                  3,  6.0,   7.0,  '#22d3ee', '🏃'),
  ev('Stand-up',                         3,  9.0,   9.25, '#818cf8', '🧍'),
  ev('Backlog Grooming',                 3,  9.5,  10.5,  '#a78bfa', '📝'),
  ev('Design Sync w/ UX Team',           3, 10.5,  11.5,  '#f472b6', '🎨'),
  ev('Working Lunch (Docs Sprint)',      3, 12.0,  13.0,  '#fb923c', '📄'),
  ev('Copilot Demo Build',              3, 13.0,  15.0,  '#34d399', '🤖'),
  ev('Cross-Team Integration Call',      3, 15.0,  16.0,  '#60a5fa', '🔗'),
  ev('Mentoring: Junior Devs',           3, 16.0,  17.0,  '#fbbf24', '🌟'),
  ev('Rock Climbing',                    3, 17.5,  19.0,  '#f87171', '🧗'),
  ev('Rotary Youth Exchange Planning',   3, 19.5,  21.0,  '#86efac', '🌍'),

  // ── Thursday (4) ────────────────────────────────────────
  ev('Yoga',                             4,  6.5,   7.5,  '#86efac', '🧘'),
  ev('Stand-up',                         4,  9.0,   9.25, '#818cf8', '🧍'),
  ev('Feature Dev: Dashboard Widgets',   4,  9.5,  12.0,  '#60a5fa', '💻'),
  ev('Lunch w/ Product Owner',           4, 12.0,  13.0,  '#fb923c', '🍱'),
  ev('Sprint Demo Rehearsal',            4, 13.0,  14.0,  '#a78bfa', '🎬'),
  ev('Sprint Demo',                      4, 14.0,  15.0,  '#f472b6', '🎤'),
  ev('Retro',                            4, 15.0,  16.0,  '#34d399', '🔄'),
  ev('Tech Blog Writing',               4, 16.0,  17.0,  '#fbbf24', '✍️'),
  ev('DevOps Conference Planning',       4, 17.5,  18.5,  '#818cf8', '📅'),
  ev('Date Night',                       4, 19.0,  21.0,  '#f87171', '❤️'),

  // ── Friday (5) ──────────────────────────────────────────
  ev('Morning Run 🏃',                  5,  6.0,   7.0,  '#22d3ee', '🏃'),
  ev('Stand-up',                         5,  9.0,   9.25, '#818cf8', '🧍'),
  ev('Hack Time / Innovation Sprint',    5,  9.5,  12.0,  '#34d399', '⚡'),
  ev('Team Lunch',                       5, 12.0,  13.0,  '#fb923c', '🌮'),
  ev('Open Source Contribution Hour',    5, 13.0,  14.5,  '#60a5fa', '🐙'),
  ev('1-on-1 with Skip-Level',           5, 14.5,  15.0,  '#a78bfa', '🤝'),
  ev('Week Wrap-Up & Planning',          5, 15.0,  16.0,  '#fbbf24', '📊'),
  ev('Happy Hour w/ Team',               5, 16.5,  18.0,  '#f472b6', '🍻'),
  ev('Concert',                          5, 20.0,  23.0,  '#f87171', '🎸'),

  // ── Saturday (6) ────────────────────────────────────────
  ev('Farmers Market',                   6,  8.0,   9.5,  '#86efac', '🥦'),
  ev('Brunch w/ College Friends',        6, 10.0,  11.5,  '#fb923c', '🥞'),
  ev('Intro to DevOps Conf Prep',        6, 12.0,  14.0,  '#818cf8', '🖥️'),
  ev('Volunteering: Rotary',             6, 14.5,  16.5,  '#fbbf24', '🤲'),
  ev('House Party',                      6, 19.0,  23.0,  '#f87171', '🎉'),

  // ── Sunday (0) ──────────────────────────────────────────
  ev('Sleep In ☀️',                      0,  9.0,  10.0,  '#a78bfa', '😴'),
  ev('Brunch & Coffee',                  0, 10.0,  11.5,  '#fb923c', '☕'),
  ev('Open Source Hacking',              0, 12.0,  14.0,  '#34d399', '💻'),
  ev('Call with Family',                 0, 14.0,  15.0,  '#f472b6', '📞'),
  ev('Meal Prep',                        0, 16.0,  17.5,  '#fbbf24', '🍳'),
  ev('Movie Night',                      0, 19.0,  21.5,  '#f87171', '🎬'),
]

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
