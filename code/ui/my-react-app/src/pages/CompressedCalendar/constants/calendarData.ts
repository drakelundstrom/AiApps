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
  ev('Stand-up',                         1,  9.0,   9.25, '#818cf8', '🧍'),
  ev('Sprint Planning',                  1,  9.5,  11.0,  '#f472b6', '📋'),
  ev('Lunch w/ Marketing Team',          1, 12.0,  13.0,  '#fb923c', '🍔'),
  ev('Architecture Review',             1, 14.0,  15.5,  '#34d399', '🏗️'),
  ev('Azure DevOps Meetup Prep',         1, 17.0,  18.0,  '#fbbf24', '🎤'),
  ev('Dinner with Friends',             1, 19.0,  20.5,  '#f87171', '🍕'),

  // ── Tuesday (2) ─────────────────────────────────────────
  ev('Yoga',                             2,  6.5,   7.5,  '#86efac', '🧘'),
  ev('Stand-up',                         2,  9.0,   9.25, '#818cf8', '🧍'),
  ev('Feature Dev: Auth Module',         2,  9.5,  12.0,  '#60a5fa', '💻'),
  ev('Pair Programming Session',         2, 13.0,  15.0,  '#f472b6', '👯'),
  ev('Columbus Azure Meetup',            2, 18.0,  20.0,  '#818cf8', '☁️'),

  // ── Wednesday (3) ───────────────────────────────────────
  ev('Stand-up',                         3,  9.0,   9.25, '#818cf8', '🧍'),
  ev('Design Sync w/ UX Team',           3, 10.5,  11.5,  '#f472b6', '🎨'),
  ev('Copilot Demo Build',              3, 13.0,  15.0,  '#34d399', '🤖'),
  ev('Mentoring: Junior Devs',           3, 16.0,  17.0,  '#fbbf24', '🌟'),
  ev('Rock Climbing',                    3, 17.5,  19.0,  '#f87171', '🧗'),
  ev('Rotary Youth Exchange Planning',   3, 19.5,  21.0,  '#86efac', '🌍'),

  // ── Thursday (4) ────────────────────────────────────────
  ev('Stand-up',                         4,  9.0,   9.25, '#818cf8', '🧍'),
  ev('Feature Dev: Dashboard Widgets',   4,  9.5,  12.0,  '#60a5fa', '💻'),
  ev('Sprint Demo',                      4, 14.0,  15.0,  '#f472b6', '🎤'),
  ev('Retro',                            4, 15.0,  16.0,  '#34d399', '🔄'),
  ev('Date Night',                       4, 19.0,  21.0,  '#f87171', '❤️'),

  // ── Friday (5) ──────────────────────────────────────────
  ev('Stand-up',                         5,  9.0,   9.25, '#818cf8', '🧍'),
  ev('Hack Time / Innovation Sprint',    5,  9.5,  12.0,  '#34d399', '⚡'),
  ev('Team Lunch',                       5, 12.0,  13.0,  '#fb923c', '🌮'),
  ev('Happy Hour w/ Team',               5, 16.5,  18.0,  '#f472b6', '🍻'),
  ev('Concert',                          5, 20.0,  23.0,  '#f87171', '🎸'),

  // ── Saturday (6) ────────────────────────────────────────
  ev('Farmers Market',                   6,  8.0,   9.5,  '#86efac', '🥦'),
  ev('Brunch w/ College Friends',        6, 10.0,  11.5,  '#fb923c', '🥞'),
  ev('House Party',                      6, 19.0,  23.0,  '#f87171', '🎉'),

  // ── Sunday (0) ──────────────────────────────────────────
  ev('Sleep In ☀️',                      0,  9.0,  10.0,  '#a78bfa', '😴'),
  ev('Brunch & Coffee',                  0, 10.0,  11.5,  '#fb923c', '☕'),
  ev('Call with Family',                 0, 14.0,  15.0,  '#f472b6', '📞'),
  ev('Movie Night',                      0, 19.0,  21.5,  '#f87171', '🎬'),
]

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
