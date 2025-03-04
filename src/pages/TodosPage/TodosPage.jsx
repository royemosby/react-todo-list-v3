import TodoForm from '../../features/TodoForm';
import TodoList from '../../features/TodoList/TodoList';
import TodosViewForm from '../../features/TodosViewForm';

function TodosPage({
  addTodo,
  todoState,
  completeTodo,
  updateTodo,
  queryString,
  setQueryString,
  sortDirection,
  setSortDirection,
  sortField,
  setSortField,
}) {
  return (
    <>
      <TodoForm onAddTodo={addTodo} isSaving={todoState.isSaving} />

      <TodoList
        isLoading={todoState.isLoading}
        todoList={todoState.todoList}
        onCompleteTodo={completeTodo}
        onUpdateTodo={updateTodo}
      />
      <hr />
      <TodosViewForm
        queryString={queryString}
        setQueryString={setQueryString}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
        sortField={sortField}
        setSortField={setSortField}
      />
    </>
  );
}

export default TodosPage;
