/**
 * Checks if a date is in the past (before today)
 * Compares at day-level precision, ignoring time-of-day
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @param {Date} currentDate - Current date to compare against
 * @returns {boolean} True if date is before today
 */
export function isDateInPast(dateString, currentDate) {
  if (!dateString) return false;
  
  try {
    const targetDate = new Date(dateString);
    if (isNaN(targetDate.getTime())) return false;
    
    targetDate.setHours(0, 0, 0, 0);
    
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    
    return targetDate < today;
  } catch (error) {
    console.error('Error parsing date:', error);
    return false;
  }
}

/**
 * Checks if a todo is overdue
 * @param {Object} todo - Todo object with completed and dueDate fields
 * @param {Date} currentDate - Current date to compare against
 * @returns {boolean} True if todo is incomplete and past due date
 */
export function isTodoOverdue(todo, currentDate) {
  return !todo.completed && isDateInPast(todo.dueDate, currentDate);
}
