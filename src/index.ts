// import * as React from 'react';
import {
  DateTime,
  Interval,
  Duration,
  DurationUnit,
  DurationObjectUnits,
  Zone,
} from 'luxon';

export function unitDuration(unit: DurationUnit): Duration {
  return Duration.fromObject({ [unit]: 1 });
}

export function unitInterval(datetime: DateTime, unit: DurationUnit): Interval {
  return Interval.fromDateTimes(datetime.startOf(unit), datetime.endOf(unit));
}

export function unitOffsetInterval(
  datetime: DateTime,
  duration: DurationObjectUnits
): Interval {
  const [[unit, count]] = Object.entries(duration);
  const start =
    count < 0 ? datetime.minus({ [unit]: Math.abs(count) }) : datetime;
  const end = count < 0 ? datetime : datetime.plus({ [unit]: count });
  return Interval.fromDateTimes(
    start.startOf(unit as DurationUnit),
    end.endOf(unit as DurationUnit)
  );
}

export function dayOf(datetime: DateTime): Interval {
  return unitInterval(datetime, 'day');
}

export function weekOf(datetime: DateTime): Interval {
  let interval = unitInterval(datetime, 'week');
  if (datetime.weekday === 7) {
    interval = unitInterval(datetime.plus(unitDuration('week')), 'week');
  }
  return interval.mapEndpoints(datetime => datetime.minus(unitDuration('day')));
}

export function monthOf(datetime: DateTime): Interval {
  return unitInterval(datetime, 'month');
}

export function paddedMonthOf(
  datetime: DateTime,
  { daysPerWeek = 7, weeksPerMonth = 6 }
): Interval {
  const month = monthOf(datetime);

  const prevStart = month.start.minus({ days: month.start.weekday });
  const prevEnd = month.start.minus({ days: 1 }).endOf('day');
  const prevMonthInterval = Interval.fromDateTimes(prevStart, prevEnd);

  const prevDays =
    month.start.weekday === 7
      ? 0
      : Math.round(intervalDuration(prevMonthInterval, 'days'));
  const monthDays = Math.round(intervalDuration(month, 'days'));
  const nextDays = daysPerWeek * weeksPerMonth - (prevDays + monthDays);
  const nextEnd = month.end.plus({ days: nextDays }).endOf('day');

  if (month.start.weekday === 7) {
    return Interval.fromDateTimes(month.start, nextEnd);
  }

  return Interval.fromDateTimes(prevStart, nextEnd);
}

export function yearOf(datetime: DateTime): Interval {
  return unitInterval(datetime, 'year');
}

export function splitByUnit(
  interval: Interval,
  unit: DurationUnit
): Interval[] {
  return interval.splitBy(unitDuration(unit));
}

export function numUnit(interval: Interval, unit: DurationUnit): number {
  return splitByUnit(interval, unit).length;
}

export function intervalDuration(
  interval: Interval,
  unit: DurationUnit
): number {
  return interval.toDuration().as(unit);
}

export function viewOfInterval(
  datetime: DateTime,
  view: DurationUnit
): Interval {
  switch (view) {
    case 'day':
    case 'days':
      return dayOf(datetime);
    case 'week':
    case 'weeks':
      return weekOf(datetime);
    case 'month':
    case 'months':
      return paddedMonthOf(datetime, { daysPerWeek: 7, weeksPerMonth: 6 });
    case 'year':
    case 'years':
      return yearOf(datetime);
    default:
      return dayOf(datetime);
  }
}

export function viewOfDays(datetime: DateTime, view: DurationUnit): Interval[] {
  return splitByUnit(viewOfInterval(datetime, view), 'days');
}

export function nextUnitInterval(
  interval: Interval,
  duration: DurationObjectUnits
): Interval {
  return interval.mapEndpoints(datetime => datetime.plus(duration));
}

export function previousUnitInterval(
  interval: Interval,
  duration: DurationObjectUnits
): Interval {
  return interval.mapEndpoints(datetime => datetime.minus(duration));
}

export function now(timezone: string | Zone = 'local'): DateTime {
  return DateTime.local().setZone(timezone);
}

export function today(timezone = 'local'): Interval {
  return dayOf(now(timezone));
}

export function yesterday(timezone = 'local'): Interval {
  return previousUnitInterval(today(timezone), { days: 1 });
}

export function thisWeek(timezone = 'local'): Interval {
  return weekOf(now(timezone));
}

export function lastWeek(timezone = 'local'): Interval {
  return previousUnitInterval(thisWeek(timezone), { weeks: 1 });
}

export function isToday(datetime: DateTime, timezone = 'local'): boolean {
  return today(timezone).contains(datetime);
}

export function isFuture(datetime: DateTime): boolean {
  return datetime.diffNow().milliseconds > 0;
}

export function isPast(datetime: DateTime): boolean {
  return !isFuture(datetime);
}

export function isWeekend(datetime: DateTime): boolean {
  return datetime.weekday > 5;
}
