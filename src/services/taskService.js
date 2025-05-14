/**
 * Service for handling task-related operations with the Apper backend
 */

// Table name from the provided schema
const TABLE_NAME = 'task25';

/**
 * Initialize ApperClient instance
 * @returns {Object} ApperClient instance
 */
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

/**
 * Fetch tasks from the backend with filtering options
 * @param {Object} filter - Filter criteria for tasks
 * @param {string} searchQuery - Search text to filter tasks
 * @param {string} priorityFilter - Priority level to filter tasks
 * @returns {Promise<Array>} List of tasks
 */
export const fetchTasks = async (filter = {}, searchQuery = '', priorityFilter = 'All') => {
  try {
    const apperClient = getApperClient();
    
    const whereConditions = [];
    
    // Add status filter based on tab selection
    if (filter.status) {
      whereConditions.push({
        fieldName: 'status',
        operator: 'ExactMatch',
        values: [filter.status]
      });
    } else if (filter.completed === false) {
      whereConditions.push({
        fieldName: 'status',
        operator: 'NotEquals',
        values: ['Completed']
      });
    } else if (filter.completed === true) {
      whereConditions.push({
        fieldName: 'status',
        operator: 'ExactMatch',
        values: ['Completed']
      });
    }
    
    // Add priority filter
    if (priorityFilter !== 'All') {
      whereConditions.push({
        fieldName: 'priority',
        operator: 'ExactMatch',
        values: [priorityFilter]
      });
    }
    
    // Add search query filter
    if (searchQuery) {
      whereConditions.push({
        operator: 'OR',
        conditions: [
          {
            fieldName: 'title',
            operator: 'Contains',
            values: [searchQuery]
          },
          {
            fieldName: 'description',
            operator: 'Contains',
            values: [searchQuery]
          },
          {
            fieldName: 'Tags',
            operator: 'Contains',
            values: [searchQuery]
          }
        ]
      });
    }
    
    const params = {
      Fields: [
        { Field: { Name: 'Id' } },
        { Field: { Name: 'Name' } },
        { Field: { Name: 'Tags' } },
        { Field: { Name: 'Owner' } },
        { Field: { Name: 'title' } },
        { Field: { Name: 'description' } },
        { Field: { Name: 'priority' } },
        { Field: { Name: 'status' } },
        { Field: { Name: 'dueDate' } },
        { Field: { Name: 'completedAt' } },
        { Field: { Name: 'CreatedOn' } }
      ],
      where: whereConditions,
      orderBy: [
        {
          field: 'dueDate',
          direction: 'ASC'
        }
      ],
      pagingInfo: {
        limit: 100,
        offset: 0
      }
    };
    
    const response = await apperClient.fetchRecords(TABLE_NAME, params);
    
    if (!response || !response.data) {
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Get a single task by ID
 * @param {string|number} id - Task ID
 * @returns {Promise<Object>} Task object
 */
export const getTaskById = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const response = await apperClient.getRecordById(TABLE_NAME, id);
    
    if (!response || !response.data) {
      throw new Error('Task not found');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching task with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      record: {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        status: taskData.status,
        dueDate: taskData.dueDate,
        Tags: taskData.tags || []
      }
    };
    
    const response = await apperClient.createRecord(TABLE_NAME, params);
    
    if (!response || !response.data) {
      throw new Error('Failed to create task');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {string|number} id - Task ID
 * @param {Object} taskData - Task data to update
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (id, taskData) => {
  try {
    const apperClient = getApperClient();
    
    // Prepare update parameters
    const updateData = {
      Id: id
    };
    
    // Only include fields that are provided in taskData
    if (taskData.title !== undefined) updateData.title = taskData.title;
    if (taskData.description !== undefined) updateData.description = taskData.description;
    if (taskData.priority !== undefined) updateData.priority = taskData.priority;
    if (taskData.status !== undefined) updateData.status = taskData.status;
    if (taskData.dueDate !== undefined) updateData.dueDate = taskData.dueDate;
    if (taskData.tags !== undefined) updateData.Tags = taskData.tags;
    
    // Add completedAt if status is changing to Completed
    if (taskData.status === 'Completed') {
      updateData.completedAt = new Date().toISOString().split('T')[0];
    } else if (taskData.status && taskData.status !== 'Completed') {
      updateData.completedAt = null;
    }
    
    const params = {
      record: updateData
    };
    
    const response = await apperClient.updateRecord(TABLE_NAME, params);
    
    if (!response || !response.data) {
      throw new Error('Failed to update task');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error updating task with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string|number} id - Task ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteTask = async (id) => {
  try {
    const apperClient = getApperClient();
    
    const params = {
      RecordIds: [id]
    };
    
    const response = await apperClient.deleteRecord(TABLE_NAME, params);
    
    if (!response || !response.success) {
      throw new Error('Failed to delete task');
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting task with ID ${id}:`, error);
    throw error;
  }
};