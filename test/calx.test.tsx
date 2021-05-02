import { DateTime, Interval } from 'luxon';
import {
  viewOfDays,
  viewOfInterval,
  dayOf,
  weekOf,
  yearOf,
  intervalDuration,
  previousUnitInterval,
  nextUnitInterval,
  numUnit,
  splitByUnit,
  today,
  isToday,
  isFuture,
  isPast,
} from '../src';

describe('days()', () => {
  it('returns dayOfs[]', () => {
    const week = weekOf(DateTime.local());
    const weekdays = splitByUnit(week, 'days');
    expect(weekdays.length).toBe(numUnit(week, 'days'));
    expect(Math.round(intervalDuration(week, 'days'))).toBe(7);
  });
});

describe('weeks()', () => {
  it('returns an array of week intervals', () => {
    const interval = yearOf(DateTime.local());
    const yearweeks = splitByUnit(interval, 'weeks');
    expect(yearweeks.length).toBe(numUnit(interval, 'weeks'));
    expect(Math.round(intervalDuration(interval, 'weeks'))).toBe(52);
  });
});

describe('dayOf()', () => {
  it('returns 00:00:00 - 23:59:59.999', () => {
    const interval = dayOf(DateTime.local());
    const { start, end } = interval;
    expect(start.hour).toBe(0);
    expect(start.minute).toBe(0);
    expect(end.hour).toBe(23);
    expect(end.minute).toBe(59);
    expect(Math.fround(intervalDuration(interval, 'hours'))).toBe(24);
  });
});

describe('weekOf()', () => {
  it('returns Sunday - Saturday', () => {
    const interval = weekOf(DateTime.local());
    expect(interval.start.weekday).toBe(7);
    expect(interval.end.weekday).toBe(6);
  });
});

describe('yearOf()', () => {
  it('returns Jan 1 - Dec 31', () => {
    const interval = yearOf(DateTime.local());
    const { start, end } = interval;
    expect(start.month).toBe(1);
    expect(start.day).toBe(1);
    expect(end.month).toBe(12);
    expect(end.day).toBe(31);
    expect(start.year).toBe(end.year);
  });
});

describe('viewOfInterval()', () => {
  it('returns a day interval for day view', () => {
    const datetime = DateTime.fromObject({ year: 2019, month: 12, day: 30 });
    const interval = viewOfInterval(datetime, 'days');
    expect(numUnit(interval, 'days')).toBe(1);
    expect(interval.start.day).toBe(30);
    expect(interval.end.day).toBe(30);
  });
  it('returns a week interval for week view', () => {
    const datetime = DateTime.fromObject({ year: 2019, month: 12, day: 30 });
    const interval = viewOfInterval(datetime, 'weeks');
    expect(numUnit(interval, 'days')).toBe(7);
    expect(interval.start.month).toBe(12);
    expect(interval.start.day).toBe(29);
    expect(interval.end.month).toBe(1);
    expect(interval.end.day).toBe(4);
  });
  it('returns a month interval for month view', () => {
    const datetime = DateTime.fromObject({ year: 2019, month: 12, day: 30 });
    const interval = viewOfInterval(datetime, 'months');
    expect(numUnit(interval, 'days')).toBe(42);
    expect(interval.start.day).toBe(1);
    expect(interval.end.day).toBe(11);
  });
  it('returns a year interval for year view', () => {
    const datetime = DateTime.fromObject({ year: 2019, month: 12, day: 30 });
    const interval = viewOfInterval(datetime, 'years');
    expect(numUnit(interval, 'days')).toBe(365);
    expect(interval.start.month).toBe(1);
    expect(interval.start.day).toBe(1);
    expect(interval.start.year).toBe(2019);
    expect(interval.end.month).toBe(12);
    expect(interval.end.day).toBe(31);
    expect(interval.end.year).toBe(2019);
  });
});

describe('viewOfDays()', () => {
  it('returns day intervals for view and datetime', () => {
    const datetime = DateTime.fromObject({ year: 2019, month: 12, day: 30 });
    const days = viewOfDays(datetime, 'month');
    expect(days.length).toBe(42);
    expect(days[0].start.day).toBe(1);
    expect(days[30].start.day).toBe(31);
  });
});

describe('previousUnitInterval()', () => {
  it('returns the interval minus 1 unit', () => {
    const interval = weekOf(DateTime.local());
    const result = previousUnitInterval(interval, { weeks: 1 });
    expect(result.start.toISO()).toEqual(
      interval.start.minus({ weeks: 1 }).toISO()
    );
  });
});

describe('nextUnitInterval()', () => {
  it('returns the interval pluse 1 unit', () => {
    const interval = weekOf(DateTime.local());
    const result = nextUnitInterval(interval, { weeks: 1 });
    expect(result.start.toISO()).toEqual(
      interval.start.plus({ weeks: 1 }).toISO()
    );
  });
});

describe('intervalDuration()', () => {
  it('returns the duration length as unit', () => {
    const interval = weekOf(DateTime.local());
    const result = intervalDuration(interval, 'weeks');
    const days = intervalDuration(interval, 'days');
    expect(Math.round(result)).toBe(1);
    expect(Math.round(days)).toBe(7);
  });
});

describe('presets', () => {
  describe('today()', () => {
    it('returns the start of today datetime', () => {
      const now = DateTime.local();
      const test = Interval.fromDateTimes(now.startOf('day'), now.endOf('day'));
      const result = today();
      expect(test.toISO()).toBe(result.toISO());
    });
    it('returns utc when passed utc || UTC timezone arg', () => {
      const now = DateTime.utc();
      const result = today('utc');
      expect(now.startOf('day').toISO()).toBe(result.start.toISO());
      expect(now.startOf('day').toISO()).toBe(today('UTC').start.toISO());
    });
  });
});

describe('predicates', () => {
  describe('isToday()', () => {
    it('returns true if it is today', () => {
      const test = DateTime.local();
      expect(isToday(test)).toBe(true);
    });
    it('returns false if it is not today', () => {
      const test = DateTime.local().minus({ days: 1 });
      expect(isToday(test)).toBe(false);
    });
  });
  describe('isFuture()', () => {
    it('returns false if date is not in the future', () => {
      const test = DateTime.local();
      const test2 = test.minus({ days: 1 });
      expect(isFuture(test)).toBe(false);
      expect(isFuture(test2)).toBe(false);
    });
    it('returns true if date is in the future', () => {
      const test = DateTime.local().plus({ days: 1 });
      expect(isFuture(test)).toBe(true);
    });
  });
  describe('isPast()', () => {
    it('returns true if date is in the past', () => {
      const test = DateTime.local();
      const test2 = test.minus({ days: 1 });
      expect(isPast(test)).toBe(true);
      expect(isPast(test2)).toBe(true);
    });
    it('returns false if date is in the future', () => {
      const test = DateTime.local().plus({ days: 1 });
      expect(isPast(test)).toBe(false);
    });
  });
});
