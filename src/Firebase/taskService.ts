import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Task {
  id?: string;
  userId: string;
  taskName: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  tags: string[];
  color: string;
  completed: boolean;
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
}

/**
 * Database service for user-specific task operations
 * Ensures data isolation between users
 */
export class TaskService {
  
  /**
   * Get the user-specific tasks collection reference
   * Structure: users/{userId}/tasks
   */
  private static getUserTasksCollection(userId: string) {
    if (!userId) {
      throw new Error('User ID is required for database operations');
    }
    return collection(db, 'users', userId, 'tasks');
  }

  /**
   * Create a new task for a specific user
   */
  static async createTask(userId: string, taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    if (!userId) {
      throw new Error('User must be authenticated to create tasks');
    }

    const tasksCollection = this.getUserTasksCollection(userId);
    
    const newTask = {
      ...taskData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(tasksCollection, newTask);
    return docRef.id;
  }

  /**
   * Get all tasks for a specific user
   * Optimized to avoid complex indexes
   */
  static async getUserTasks(userId: string): Promise<Task[]> {
    if (!userId) {
      throw new Error('User must be authenticated to fetch tasks');
    }

    const tasksCollection = this.getUserTasksCollection(userId);
    // Simple query without ordering to avoid index requirements
    const querySnapshot = await getDocs(tasksCollection);
    
    const tasks = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings for Redux serialization
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date(data.createdAt).toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date(data.updatedAt).toISOString() || new Date().toISOString(),
      } as Task;
    });

    // Sort client-side by creation time (most recent first)
    return tasks.sort((a, b) => {
      const aTime = new Date(a.createdAt);
      const bTime = new Date(b.createdAt);
      return bTime.getTime() - aTime.getTime();
    });
  }

  /**
   * Get completed tasks for a specific user
   * Optimized to avoid complex indexes
   */
  static async getCompletedTasks(userId: string): Promise<Task[]> {
    if (!userId) {
      throw new Error('User must be authenticated to fetch tasks');
    }

    const tasksCollection = this.getUserTasksCollection(userId);
    // Simple query by completion status only
    const q = query(
      tasksCollection, 
      where('completed', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    
    const tasks = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings for Redux serialization
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date(data.createdAt).toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date(data.updatedAt).toISOString() || new Date().toISOString(),
      } as Task;
    });

    // Sort client-side to avoid needing composite index
    return tasks.sort((a, b) => {
      const aTime = new Date(a.updatedAt);
      const bTime = new Date(b.updatedAt);
      return bTime.getTime() - aTime.getTime();
    });
  }

  /**
   * Get pending tasks for a specific user
   * Optimized to avoid complex indexes
   */
  static async getPendingTasks(userId: string): Promise<Task[]> {
    if (!userId) {
      throw new Error('User must be authenticated to fetch tasks');
    }

    const tasksCollection = this.getUserTasksCollection(userId);
    // Simple query by completion status only
    const q = query(
      tasksCollection, 
      where('completed', '==', false)
    );
    
    const querySnapshot = await getDocs(q);
    
    const tasks = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings for Redux serialization
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date(data.createdAt).toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date(data.updatedAt).toISOString() || new Date().toISOString(),
      } as Task;
    });

    // Sort client-side to avoid needing composite index
    return tasks.sort((a, b) => {
      const aTime = new Date(a.createdAt);
      const bTime = new Date(b.createdAt);
      return bTime.getTime() - aTime.getTime();
    });
  }

  /**
   * Get today's tasks for a specific user
   * Optimized to avoid complex indexes
   */
  static async getTodayTasks(userId: string): Promise<Task[]> {
    if (!userId) {
      throw new Error('User must be authenticated to fetch tasks');
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD format

    const tasksCollection = this.getUserTasksCollection(userId);
    // Simple query by due date only
    const q = query(
      tasksCollection, 
      where('dueDate', '==', todayString)
    );
    
    const querySnapshot = await getDocs(q);
    
    const tasks = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings for Redux serialization
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date(data.createdAt).toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date(data.updatedAt).toISOString() || new Date().toISOString(),
      } as Task;
    });

    // Sort client-side by time
    return tasks.sort((a, b) => {
      const aTime = a.dueTime || '23:59';
      const bTime = b.dueTime || '23:59';
      return aTime.localeCompare(bTime);
    });
  }

  /**
   * Get upcoming tasks for a specific user
   * Optimized to avoid complex indexes
   */
  static async getUpcomingTasks(userId: string): Promise<Task[]> {
    if (!userId) {
      throw new Error('User must be authenticated to fetch tasks');
    }

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const tasksCollection = this.getUserTasksCollection(userId);
    // Simple query by due date only
    const q = query(
      tasksCollection, 
      where('dueDate', '>', todayString)
    );
    
    const querySnapshot = await getDocs(q);
    
    const tasks = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings for Redux serialization
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date(data.createdAt).toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date(data.updatedAt).toISOString() || new Date().toISOString(),
      } as Task;
    });

    // Sort client-side by date and time
    return tasks.sort((a, b) => {
      const aDateTime = new Date(`${a.dueDate}T${a.dueTime || '23:59'}`);
      const bDateTime = new Date(`${b.dueDate}T${b.dueTime || '23:59'}`);
      return aDateTime.getTime() - bDateTime.getTime();
    });
  }

  /**
   * Update a specific task for a user
   */
  static async updateTask(userId: string, taskId: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>): Promise<void> {
    if (!userId) {
      throw new Error('User must be authenticated to update tasks');
    }

    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(taskRef, updateData);
  }

  /**
   * Delete a specific task for a user
   */
  static async deleteTask(userId: string, taskId: string): Promise<void> {
    if (!userId) {
      throw new Error('User must be authenticated to delete tasks');
    }

    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskRef);
  }

  /**
   * Toggle task completion status
   */
  static async toggleTaskCompletion(userId: string, taskId: string): Promise<void> {
    if (!userId) {
      throw new Error('User must be authenticated to update tasks');
    }

    // First, get the current task to know its completion status
    const tasks = await this.getUserTasks(userId);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    await this.updateTask(userId, taskId, {
      completed: !task.completed
    });
  }

  /**
   * Search tasks for a user
   */
  static async searchUserTasks(userId: string, searchQuery: string): Promise<Task[]> {
    if (!userId) {
      throw new Error('User must be authenticated to search tasks');
    }

    // Get all user tasks and filter client-side
    // Note: Firestore doesn't support full-text search natively
    const allTasks = await this.getUserTasks(userId);
    
    const lowercaseQuery = searchQuery.toLowerCase();
    
    return allTasks.filter(task => 
      task.taskName.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery) ||
      task.category.toLowerCase().includes(lowercaseQuery) ||
      task.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}

export default TaskService;