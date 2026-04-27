import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  subDays,
  subWeeks,
  subMonths,
  subYears,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  getWeek,
} from "date-fns";
import { CalendarEvent, ViewType } from "./types";

// Date night spots (cycled through on Saturdays) — Chicago restaurants & couple activities
const DATE_NIGHT_RESTAURANTS = [
  { name: "Thattu", address: "2601 W Fletcher St, Chicago, IL 60618" },
  { name: "Crying Tiger", address: "51 W Hubbard St, Chicago, IL 60654" },
  { name: "Smyth", address: "177 N Ada St, Chicago, IL 60607" },
  { name: "Giant", address: "3209 W Armitage Ave, Chicago, IL 60647" },
  { name: "Monteverde", address: "1020 W Madison St, Chicago, IL 60607" },
  { name: "Galit", address: "2429 N Lincoln Ave, Chicago, IL 60614" },
  { name: "wine night", address: "home" },
  { name: "cooking class", address: "The Chopping Block, 4747 N Lincoln Ave, Chicago, IL 60625" },
  { name: "cocktail making class", address: "Hollow Leg, 4356 W Ford City Dr, Chicago, IL 60652" },
  { name: "trivia night", address: "Nisei Lounge, 3439 N Sheffield Ave, Chicago, IL 60657" },
  { name: "jazz night", address: "Andy's Jazz Club, 11 E Hubbard St, Chicago, IL 60611" },
  { name: "comedy show", address: "Second City, 1616 N Wells St, Chicago, IL 60614" },
  { name: "art museum date", address: "Art Institute of Chicago, 111 S Michigan Ave, Chicago, IL 60603" },
];

// Get a consistent restaurant for a given Saturday (based on week number)
function getRestaurantForSaturday(date: Date): (typeof DATE_NIGHT_RESTAURANTS)[0] {
  const weekNumber = getWeek(date);
  const index = weekNumber % DATE_NIGHT_RESTAURANTS.length;
  return DATE_NIGHT_RESTAURANTS[index];
}

// Date night start times (2.5 hour duration)
const DATE_NIGHT_TIMES = [
  { start: "18:00", end: "20:30" },
  { start: "18:15", end: "20:45" },
  { start: "18:30", end: "21:00" },
];

// Get a consistent start time for date night (varies week to week)
function getDateNightTime(date: Date): (typeof DATE_NIGHT_TIMES)[0] {
  const weekNumber = getWeek(date);
  const index = weekNumber % DATE_NIGHT_TIMES.length;
  return DATE_NIGHT_TIMES[index];
}


// Get a deterministic pattern index based on the date (varies week to week)
function getPatternIndex(day: Date, patternCount: number): number {
  // Use week number + day of week to ensure different patterns each week
  const startOfYear = new Date(day.getFullYear(), 0, 1);
  const daysSinceStart = Math.floor((day.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.floor(daysSinceStart / 7);
  const dayOfWeek = day.getDay();
  return (weekNumber * 3 + dayOfWeek) % patternCount;
}

// Generate sample events for any day (on-demand, no pre-generation needed)
function generateSampleEventsForDay(day: Date): CalendarEvent[] {
  const dateStr = format(day, "yyyy-MM-dd");
  const dayOfWeek = day.getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const isTuesday = dayOfWeek === 2;
  const isSaturday = dayOfWeek === 6;

  const events: CalendarEvent[] = [];

  // exercise - 7-8am every day
  events.push({
    id: `sample-exercise-${dateStr}`,
    title: "exercise",
    startDate: dateStr,
    endDate: dateStr,
    startTime: "07:00",
    endTime: "08:00",
    isAllDay: false,
    calendarId: "exercise",
  });

  // work - 8:30am-5pm every day
  events.push({
    id: `sample-focus-${dateStr}`,
    title: "work",
    startDate: dateStr,
    endDate: dateStr,
    startTime: "08:30",
    endTime: "17:00",
    isAllDay: false,
    calendarId: "focus",
  });

  // happy hour - every Tuesday 5-6pm
  if (isWeekday && isTuesday) {
    events.push({
      id: `sample-happyhour-${dateStr}`,
      title: "happy hour",
      startDate: dateStr,
      endDate: dateStr,
      startTime: "17:00",
      endTime: "18:00",
      isAllDay: false,
      calendarId: "events",
    });
  }

  // date night - every Saturday
  if (isSaturday) {
    const restaurant = getRestaurantForSaturday(day);
    const dateNightTime = getDateNightTime(day);
    events.push({
      id: `sample-datenight-${dateStr}`,
      title: "date night",
      startDate: dateStr,
      endDate: dateStr,
      startTime: dateNightTime.start,
      endTime: dateNightTime.end,
      isAllDay: false,
      calendarId: "meals",
      location: `${restaurant.name.toLowerCase()}, ${restaurant.address.toLowerCase()}`,
    });
  }

  return events;
}

// Generate holidays for a specific day (on-demand)
function getHolidaysForDay(day: Date): CalendarEvent[] {
  const year = day.getFullYear();
  const month = day.getMonth();
  const date = day.getDate();
  const dateStr = format(day, "yyyy-MM-dd");
  const holidays: CalendarEvent[] = [];

  // Helper functions
  const getNthWeekday = (y: number, m: number, weekday: number, n: number): number => {
    const firstDay = new Date(y, m, 1);
    const firstWeekday = firstDay.getDay();
    return 1 + ((weekday - firstWeekday + 7) % 7) + (n - 1) * 7;
  };

  const getLastWeekday = (y: number, m: number, weekday: number): number => {
    const lastDay = new Date(y, m + 1, 0);
    const lastWeekday = lastDay.getDay();
    const diff = (lastWeekday - weekday + 7) % 7;
    return lastDay.getDate() - diff;
  };

  // Check each holiday
  if (month === 0 && date === 1) {
    holidays.push({ id: `holiday-newyear-${year}`, title: "new year's day", startDate: dateStr, endDate: dateStr, isAllDay: true, calendarId: "holidays" });
  }
  if (month === 0 && date === getNthWeekday(year, 0, 1, 3)) {
    holidays.push({ id: `holiday-mlk-${year}`, title: "martin luther king jr. day", startDate: dateStr, endDate: dateStr, isAllDay: true, calendarId: "holidays" });
  }
  if (month === 1 && date === getNthWeekday(year, 1, 1, 3)) {
    holidays.push({ id: `holiday-presidents-${year}`, title: "presidents' day", startDate: dateStr, endDate: dateStr, isAllDay: true, calendarId: "holidays" });
  }
  if (month === 4 && date === getLastWeekday(year, 4, 1)) {
    holidays.push({ id: `holiday-memorial-${year}`, title: "memorial day", startDate: dateStr, endDate: dateStr, isAllDay: true, calendarId: "holidays" });
  }
  if (month === 6 && date === 4) {
    holidays.push({ id: `holiday-july4-${year}`, title: "independence day", startDate: dateStr, endDate: dateStr, isAllDay: true, calendarId: "holidays" });
  }
  if (month === 8 && date === getNthWeekday(year, 8, 1, 1)) {
    holidays.push({ id: `holiday-labor-${year}`, title: "labor day", startDate: dateStr, endDate: dateStr, isAllDay: true, calendarId: "holidays" });
  }
  if (month === 9 && date === getNthWeekday(year, 9, 1, 2)) {
    holidays.push({ id: `holiday-columbus-${year}`, title: "columbus day", startDate: dateStr, endDate: dateStr, isAllDay: true, calendarId: "holidays" });
  }
  if (month === 10 && date === 11) {
    holidays.push({ id: `holiday-veterans-${year}`, title: "veterans day", startDate: dateStr, endDate: dateStr, isAllDay: true, calendarId: "holidays" });
  }
  if (month === 10 && date === getNthWeekday(year, 10, 4, 4)) {
    holidays.push({ id: `holiday-thanksgiving-${year}`, title: "thanksgiving", startDate: dateStr, endDate: dateStr, isAllDay: true, calendarId: "holidays" });
  }
  if (month === 11 && date === 25) {
    holidays.push({ id: `holiday-christmas-${year}`, title: "christmas day", startDate: dateStr, endDate: dateStr, isAllDay: true, calendarId: "holidays" });
  }

  return holidays;
}

// Navigation helpers
export function navigateDate(
  date: Date,
  direction: "prev" | "next",
  view: ViewType
): Date {
  const add = direction === "next";
  switch (view) {
    case "day":
      return add ? addDays(date, 1) : subDays(date, 1);
    case "week":
      return add ? addWeeks(date, 1) : subWeeks(date, 1);
    case "month":
      return add ? addMonths(date, 1) : subMonths(date, 1);
    case "year":
      return add ? addYears(date, 1) : subYears(date, 1);
  }
}

// Get days for month view (includes days from adjacent months)
export function getMonthViewDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const start = startOfWeek(monthStart);
  const end = endOfWeek(monthEnd);

  return eachDayOfInterval({ start, end });
}

// Get days for week view
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  const end = endOfWeek(date);

  return eachDayOfInterval({ start, end });
}

// Get hours for day/week time grid
export function getDayHours(): number[] {
  return Array.from({ length: 24 }, (_, i) => i);
}

// Format helpers
export function formatDateHeader(date: Date, view: ViewType): string {
  switch (view) {
    case "day":
      return format(date, "MMMM d, yyyy");
    case "week":
    case "month":
      return format(date, "MMMM yyyy");
    case "year":
      return format(date, "yyyy");
  }
}

export function formatDayOfWeek(date: Date): string {
  return format(date, "EEEE");
}

export function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "Noon";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function formatWeekDayHeader(date: Date): string {
  return format(date, "EEE d");
}

// Event helpers - merges user events with on-demand generated sample events and holidays
export function getEventsForDay(
  userEvents: CalendarEvent[],
  day: Date
): CalendarEvent[] {
  const dayStr = format(day, "yyyy-MM-dd");

  // User events that fall on this day
  const userEventsForDay = userEvents.filter((event) => {
    const eventStart = event.startDate;
    const eventEnd = event.endDate;
    return dayStr >= eventStart && dayStr <= eventEnd;
  });

  // Generate sample events and holidays on-demand
  const sampleEvents = generateSampleEventsForDay(day);
  const holidays = getHolidaysForDay(day);

  return [...holidays, ...sampleEvents, ...userEventsForDay];
}

export function getEventsForDateRange(
  events: CalendarEvent[],
  start: Date,
  end: Date
): CalendarEvent[] {
  const startStr = format(start, "yyyy-MM-dd");
  const endStr = format(end, "yyyy-MM-dd");

  return events.filter((event) => {
    // Event overlaps with range if event starts before range ends AND event ends after range starts
    return event.startDate <= endStr && event.endDate >= startStr;
  });
}

// Calculate event position in time grid (for day/week views)
export function getEventTimePosition(event: CalendarEvent): {
  top: number;
  height: number;
} {
  if (event.isAllDay || !event.startTime || !event.endTime) {
    return { top: 0, height: 0 };
  }

  const [startHour, startMin] = event.startTime.split(":").map(Number);
  const [endHour, endMin] = event.endTime.split(":").map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  // Each hour is 60px tall
  const hourHeight = 60;
  const top = (startMinutes / 60) * hourHeight;
  const height = ((endMinutes - startMinutes) / 60) * hourHeight;

  // Subtract 2px for visual gap between back-to-back events
  return { top, height: Math.max(height - 2, 15) };
}

// Round time to nearest 15 minutes
export function roundToNearest15(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

// Convert pixel position to time
// Returns hour in range [0, 24] where 24:00 represents midnight/end of day
export function pixelToTime(
  pixelY: number,
  hourHeight: number = 60
): { hour: number; minute: number } {
  const totalMinutes = (pixelY / hourHeight) * 60;
  // Clamp to valid range [0, 1440] (0:00 to 24:00)
  const clampedMinutes = Math.max(0, Math.min(24 * 60, totalMinutes));
  const roundedMinutes = roundToNearest15(clampedMinutes);

  // Calculate hour and minute
  let hour = Math.floor(roundedMinutes / 60);
  let minute = roundedMinutes % 60;

  // Clamp hour to [0, 24], and if hour is 24, minute must be 0
  hour = Math.min(24, Math.max(0, hour));
  if (hour === 24) {
    minute = 0;
  }

  return { hour, minute };
}

// Format time for display
export function formatTime(hour: number, minute: number): string {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  const m = minute.toString().padStart(2, "0");
  return `${h}:${m} ${ampm}`;
}

// Format event time string (HH:mm) to 12-hour format (e.g., "7am", "1:30pm")
export function formatEventTime(timeStr: string): string {
  const [hour, minute] = timeStr.split(":").map(Number);
  // Handle 24:00 as midnight (end of day)
  const displayHour = hour === 24 ? 0 : hour;
  const h = displayHour % 12 || 12;
  const ampm = displayHour < 12 ? "am" : "pm";
  if (minute === 0) {
    return `${h}${ampm}`;
  }
  return `${h}:${minute.toString().padStart(2, "0")}${ampm}`;
}

// Format time as HH:mm
export function formatTimeValue(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;
}

// Parse HH:mm to hour and minute
export function parseTimeValue(time: string): { hour: number; minute: number } {
  const [hour, minute] = time.split(":").map(Number);
  return { hour, minute };
}

// Check if a date is today
export { isToday, isSameDay, isSameMonth, format, parseISO };

// Get all months in a year
export function getYearMonths(year: number): Date[] {
  return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
}
