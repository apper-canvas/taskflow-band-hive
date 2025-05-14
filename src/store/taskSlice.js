import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTasks, getTaskById, createTask, updateTask, deleteTask } from '../services/taskService';

export const fetchTasksAction = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ filter = {}, searchQuery = '', priorityFilter = 'All' }, { rejectWithValue }) => {
    try {
      const response = await fetchTasks(filter, searchQuery, priorityFilter);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTaskAction = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await createTask(taskData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateTaskAction = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await updateTask(id, taskData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteTaskAction = createAsyncThunk(
  'tasks/deleteTask',
  async (id, { rejectWithValue }) => {
    try {
      await deleteTask(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasksAction.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasksAction.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTasksAction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Create task
      .addCase(createTaskAction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update task
      .addCase(updateTaskAction.fulfilled, (state, action) => {
        const index = state.items.findIndex(task => task.Id === action.payload.Id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      // Delete task
      .addCase(deleteTaskAction.fulfilled, (state, action) => {
        state.items = state.items.filter(task => task.Id !== action.payload);
      });
  },
});

export default taskSlice.reducer;