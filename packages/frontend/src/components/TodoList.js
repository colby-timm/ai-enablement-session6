import React, { useMemo } from 'react';
import TodoCard from './TodoCard';
import OverdueSummary from './OverdueSummary';
import { isTodoOverdue } from '../utils/dateUtils';

function TodoList({ todos, currentTime, onToggle, onEdit, onDelete, isLoading }) {
  const overdueCount = useMemo(() => {
    return todos.filter(todo => isTodoOverdue(todo, currentTime)).length;
  }, [todos, currentTime]);

  if (todos.length === 0) {
    return (
      <div className="todo-list empty-state">
        <p className="empty-state-message">
          No todos yet. Add one to get started! 👻
        </p>
      </div>
    );
  }

  return (
    <div className="todo-list">
      <OverdueSummary count={overdueCount} />
      {todos.map((todo) => (
        <TodoCard
          key={todo.id}
          todo={todo}
          currentTime={currentTime}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}

export default TodoList;
