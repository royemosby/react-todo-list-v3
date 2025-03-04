import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import TodoListItem from './TodoListItem';
import styles from './TodoList.module.css';

function TodoList({ todoList, onCompleteTodo, onUpdateTodo, isLoading }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const filteredTodoList = todoList.filter(
    (todo) => todo.isCompleted === false
  );

  const itemsPerPage = 15;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const indexOfFirstTodo = (currentPage - 1) * itemsPerPage;

  const currentTodos = filteredTodoList.slice(
    indexOfFirstTodo,
    indexOfFirstTodo + itemsPerPage
  );

  const totalPages = Math.ceil(filteredTodoList.length / itemsPerPage);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (isNaN(currentPage) || currentPage < 1 || currentPage > totalPages) {
      navigate('/');
    }
  }, [currentPage, totalPages, navigate, isLoading]);

  const handlePreviousPage = () => {
    setSearchParams({ page: Math.max(currentPage - 1, 1) });
  };

  const handleNextPage = () => {
    setSearchParams({ page: Math.min(currentPage + 1, totalPages) });
  };

  return (
    <>
      {filteredTodoList.length === 0 ? (
        <>
          {isLoading ? (
            <p>Todo list loading...</p>
          ) : (
            <p>Add a todo above to get started</p>
          )}
        </>
      ) : (
        <>
          <ul className={styles.todoList}>
            {currentTodos.map((todo) => (
              <TodoListItem
                key={todo.id}
                todo={todo}
                onCompleteTodo={onCompleteTodo}
                onUpdateTodo={onUpdateTodo}
              />
            ))}
          </ul>
          <div className={styles.paginationControls}>
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default TodoList;
