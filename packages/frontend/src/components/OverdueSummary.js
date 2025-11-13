import React from 'react';

function OverdueSummary({ count }) {
  if (count === 0) {
    return null;
  }

  return (
    <div className="overdue-summary" role="status" aria-live="polite">
      <span className="overdue-summary-icon" aria-hidden="true">⚠️</span>
      <span className="overdue-summary-text">
        {count} {count === 1 ? 'todo' : 'todos'} overdue
      </span>
    </div>
  );
}

export default OverdueSummary;
