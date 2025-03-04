import { useCallback, useEffect, useReducer, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router';
import styles from './App.module.css';
import './App.css';
import {
  reducer as todosReducer,
  actions as todoActions,
  initialState as initialTodosState,
} from './reducers/todos.reducer';
import TodosPage from './pages/TodosPage/TodosPage';
import About from './pages/About/About';
import Header from './shared/Header';
import NotFound from './pages/NotFound/NotFound';

const token = `Bearer ${import.meta.env.VITE_PAT}`;

function App() {
  const [sortDirection, setSortDirection] = useState('desc');
  const [sortField, setSortField] = useState('createdTime');
  const [queryString, setQueryString] = useState('');
  const [todoState, dispatch] = useReducer(todosReducer, initialTodosState);
  const [title, setTitle] = useState('Todo List');
  const location = useLocation();

  //Airtable-specific URL with params
  const encodeUrl = useCallback(() => {
    const url = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
    let searchQuery = '';
    let sortQuery = `sort[0][field]=${sortField}&sort[0][direction]=${sortDirection}`;
    if (queryString) {
      searchQuery = `&filterByFormula=SEARCH("${queryString}",+title)`;
    }
    return encodeURI(`${url}?${sortQuery}${searchQuery}`);
  }, [queryString, sortField, sortDirection]);

  useEffect(() => {
    const fetchTodos = async () => {
      dispatch({ type: todoActions.fetchTodos });
      const options = {
        method: 'GET',
        headers: {
          Authorization: token,
        },
      };
      try {
        const resp = await fetch(encodeUrl(), options);
        if (!resp.ok) {
          throw new Error(resp.message);
        }
        const { records } = await resp.json();
        dispatch({ type: todoActions.loadTodos, records });
      } catch (error) {
        dispatch({ type: todoActions.setLoadError, error });
      }
    };
    fetchTodos();
  }, [queryString, sortDirection, sortField, encodeUrl]);

  useEffect(() => {
    if (location.pathname === '/') {
      setTitle('Todo List');
    } else if (location.pathname === '/about') {
      setTitle('About');
    } else {
      setTitle('Not Found');
    }
  }, [location]);
  //pessimistic
  const addTodo = async (newTodo) => {
    const payload = {
      records: [
        {
          fields: {
            title: newTodo.title,
            isCompleted: newTodo.isCompleted,
          },
        },
      ],
    };
    const options = {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    try {
      dispatch({ type: todoActions.startRequest });
      const resp = await fetch(encodeUrl(), options);
      if (!resp.ok) {
        throw new Error(resp.error);
      }
      const { records } = await resp.json();
      dispatch({ type: todoActions.addTodo, records });
    } catch (error) {
      dispatch({ type: todoActions.setLoadError, error });
    } finally {
      dispatch({ type: todoActions.endRequest });
    }
  };

  //optimistic - uses catch to revert
  const updateTodo = async (editedTodo) => {
    const originalTodo = todoState.todoList.find(
      (todo) => todo.id === editedTodo.id
    );
    dispatch({ type: todoActions.updateTodo, editedTodo });

    try {
      const payload = {
        records: [
          {
            id: editedTodo.id,
            fields: {
              //explicitly only want these fields
              title: editedTodo.title,
              createdTime: editedTodo.createdTime,
              isCompleted: editedTodo.isCompleted,
            },
          },
        ],
      };
      const options = {
        method: 'PATCH',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };

      const resp = await fetch(encodeUrl(), options);
      if (!resp.ok) {
        throw new Error(resp.error);
      }
    } catch (error) {
      dispatch({
        type: todoActions.revertTodo,
        editedTodo: originalTodo,
        error,
      });
    } finally {
      dispatch({ type: todoActions.endRequest });
    }
  };

  //optimistic - uses catch to revert
  const completeTodo = async (id) => {
    const [originalTodo] = todoState.todoList.filter((todo) => todo.id === id);

    dispatch({ type: todoActions.completeTodo, id });

    try {
      const payload = {
        records: [
          {
            id: id,
            fields: {
              isCompleted: true,
            },
          },
        ],
      };
      const options = {
        method: 'PATCH',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      const resp = await fetch(encodeUrl(), options);
      if (!resp.ok) {
        throw new Error(resp.error);
      }
    } catch (error) {
      dispatch({
        type: todoActions.revertTodo,
        editedTodo: originalTodo,
        error: { message: `${error.message}. Reverting todo...` },
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <Header title={title} />
      <Routes>
        <Route
          path="/"
          element={
            <TodosPage
              addTodo={addTodo}
              todoState={todoState}
              completeTodo={completeTodo}
              updateTodo={updateTodo}
              queryString={queryString}
              setQueryString={setQueryString}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
              sortField={sortField}
              setSortField={setSortField}
            />
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {todoState.errorMessage && (
        <div className={styles.errorWrapper}>
          <hr />
          <p className={styles.errorMessage}>{todoState.errorMessage}</p>
          <button
            type="button"
            onClick={() => dispatch({ type: todoActions.clearError })}
          >
            Dismiss Error Message
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
