import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export interface Task {
  id?: string;
  userId: string;
  taskName: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: "High" | "Medium" | "Low";
  category: string;
  tags: string[];
  color: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  reminders?: Date[];
}

function getUserTasksCollection(userId: string) {
  if (!userId) throw new Error("User ID is required for database operations");
  return collection(db, "users", userId, "tasks");
}

export async function createTask(
  userId: string,
  taskData: Omit<Task, "id" | "userId" | "createdAt" | "updatedAt">,
  reminders?: Date[]
): Promise<string> {
  if (!userId) throw new Error("User must be authenticated to create tasks");

  const tasksCollection = getUserTasksCollection(userId);
  const newTaskRef = doc(tasksCollection);

  const batch = writeBatch(db);

  const task = {
    ...taskData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  batch.set(newTaskRef, task);

  if (reminders && reminders.length > 0) {
    const remindersCollection = collection(newTaskRef, "reminders");
    reminders.forEach((reminder) => {
      const reminderRef = doc(remindersCollection);
      batch.set(reminderRef, { time: reminder });
    });
  }

  await batch.commit();

  return newTaskRef.id;
}

export async function getUserTasks(userId: string): Promise<Task[]> {
  if (!userId) throw new Error("User must be authenticated to fetch tasks");
  const tasksCollection = getUserTasksCollection(userId);
  const querySnapshot = await getDocs(tasksCollection);
  const tasks = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString() ||
        new Date(data.createdAt).toISOString() ||
        new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate?.()?.toISOString() ||
        new Date(data.updatedAt).toISOString() ||
        new Date().toISOString(),
    } as Task;
  });
  return tasks.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getCompletedTasks(userId: string): Promise<Task[]> {
  if (!userId) throw new Error("User must be authenticated to fetch tasks");
  const tasksCollection = getUserTasksCollection(userId);
  const q = query(tasksCollection, where("completed", "==", true));
  const querySnapshot = await getDocs(q);
  const tasks = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString() ||
        new Date(data.createdAt).toISOString() ||
        new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate?.()?.toISOString() ||
        new Date(data.updatedAt).toISOString() ||
        new Date().toISOString(),
    } as Task;
  });
  return tasks.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getPendingTasks(userId: string): Promise<Task[]> {
  if (!userId) throw new Error("User must be authenticated to fetch tasks");
  const tasksCollection = getUserTasksCollection(userId);
  const q = query(tasksCollection, where("completed", "==", false));
  const querySnapshot = await getDocs(q);
  const tasks = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString() ||
        new Date(data.createdAt).toISOString() ||
        new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate?.()?.toISOString() ||
        new Date(data.updatedAt).toISOString() ||
        new Date().toISOString(),
    } as Task;
  });
  return tasks.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getTodayTasks(userId: string): Promise<Task[]> {
  if (!userId) throw new Error("User must be authenticated to fetch tasks");
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const tasksCollection = getUserTasksCollection(userId);
  const q = query(tasksCollection, where("dueDate", "==", todayString));
  const querySnapshot = await getDocs(q);
  const tasks = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString() ||
        new Date(data.createdAt).toISOString() ||
        new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate?.()?.toISOString() ||
        new Date(data.updatedAt).toISOString() ||
        new Date().toISOString(),
    } as Task;
  });
  return tasks.sort((a, b) =>
    (a.dueTime || "23:59").localeCompare(b.dueTime || "23:59")
  );
}

export async function getUpcomingTasks(userId: string): Promise<Task[]> {
  if (!userId) throw new Error("User must be authenticated to fetch tasks");
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const tasksCollection = getUserTasksCollection(userId);
  const q = query(tasksCollection, where("dueDate", ">", todayString));
  const querySnapshot = await getDocs(q);
  const tasks = querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString() ||
        new Date(data.createdAt).toISOString() ||
        new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate?.()?.toISOString() ||
        new Date(data.updatedAt).toISOString() ||
        new Date().toISOString(),
    } as Task;
  });
  return tasks.sort((a, b) => {
    const aDateTime = new Date(`${a.dueDate}T${a.dueTime || "23:59"}`);
    const bDateTime = new Date(`${b.dueDate}T${b.dueTime || "23:59"}`);
    return aDateTime.getTime() - bDateTime.getTime();
  });
}

export async function updateTask(
  userId: string,
  taskId: string,
  updates: Partial<Omit<Task, "id" | "userId" | "createdAt">>
): Promise<void> {
  const currentUser = auth.currentUser;
  console.log("Current user:", currentUser);
  console.log("Provided userId:", userId);
  console.log("User authenticated:", !!currentUser);
  console.log("UIDs match:", currentUser?.uid === userId);

  if (!userId) throw new Error("User must be authenticated to update tasks");
  const taskRef = doc(db, "users", userId, "tasks", taskId);
  const updateData = {
    ...updates,
    updatedAt: serverTimestamp(),
  };
  console.log(updateData);
  await updateDoc(taskRef, updateData);
}

export async function deleteTask(
  userId: string,
  taskId: string
): Promise<void> {
  if (!userId) throw new Error("User must be authenticated to delete tasks");
  const taskRef = doc(db, "users", userId, "tasks", taskId);
  await deleteDoc(taskRef);
}

export async function toggleTaskCompletion(
  userId: string,
  taskId: string
): Promise<void> {
  if (!userId) throw new Error("User must be authenticated to update tasks");
  const tasks = await getUserTasks(userId);
  const task = tasks.find((t) => t.id === taskId);
  if (!task) throw new Error("Task not found");
  await updateTask(userId, taskId, { completed: !task.completed });
}

export async function searchUserTasks(
  userId: string,
  searchQuery: string
): Promise<Task[]> {
  if (!userId) throw new Error("User must be authenticated to search tasks");
  const allTasks = await getUserTasks(userId);
  const lowercaseQuery = searchQuery.toLowerCase();
  return allTasks.filter(
    (task) =>
      task.taskName.toLowerCase().includes(lowercaseQuery) ||
      task.description.toLowerCase().includes(lowercaseQuery) ||
      task.category.toLowerCase().includes(lowercaseQuery) ||
      task.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
  );
}
