import { isDateInPast, isTodoOverdue } from '../dateUtils';

describe('dateUtils', () => {
  const mockCurrentDate = new Date('2025-11-13T12:00:00.000Z');

  describe('isDateInPast', () => {
    it('should return false for future dates', () => {
      expect(isDateInPast('2025-11-20', mockCurrentDate)).toBe(false);
    });

    it('should return false for today\'s date', () => {
      expect(isDateInPast('2025-11-13', mockCurrentDate)).toBe(false);
    });

    it('should return true for past dates', () => {
      expect(isDateInPast('2025-11-10', mockCurrentDate)).toBe(true);
    });

    it('should return false for null or undefined dates', () => {
      expect(isDateInPast(null, mockCurrentDate)).toBe(false);
      expect(isDateInPast(undefined, mockCurrentDate)).toBe(false);
    });

    it('should return false for invalid date strings', () => {
      expect(isDateInPast('invalid-date', mockCurrentDate)).toBe(false);
    });

    it('should normalize time-of-day to midnight', () => {
      const earlyMorning = new Date('2025-11-13T01:00:00.000Z');
      const lateNight = new Date('2025-11-13T23:59:59.000Z');
      
      expect(isDateInPast('2025-11-13', earlyMorning)).toBe(false);
      expect(isDateInPast('2025-11-13', lateNight)).toBe(false);
    });
  });

  describe('isTodoOverdue', () => {
    it('should return true for incomplete todo with past due date', () => {
      const todo = { completed: false, dueDate: '2025-11-10' };
      expect(isTodoOverdue(todo, mockCurrentDate)).toBe(true);
    });

    it('should return false for completed todo with past due date', () => {
      const todo = { completed: true, dueDate: '2025-11-10' };
      expect(isTodoOverdue(todo, mockCurrentDate)).toBe(false);
    });

    it('should return false for incomplete todo with future due date', () => {
      const todo = { completed: false, dueDate: '2025-11-20' };
      expect(isTodoOverdue(todo, mockCurrentDate)).toBe(false);
    });

    it('should return false for todo without due date', () => {
      const todo = { completed: false, dueDate: null };
      expect(isTodoOverdue(todo, mockCurrentDate)).toBe(false);
    });
  });
});
