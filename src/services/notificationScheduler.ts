import emailService from './emailNotificationService';

interface TaskReminder {
  taskId: string;
  taskName: string;
  dueDate: string;
  dueTime?: string;
  userEmail: string;
  category?: string;
  priority?: string;
  reminderTime: Date;
}

class NotificationScheduler {
  private static instance: NotificationScheduler;
  private scheduledNotifications = new Map<string, NodeJS.Timeout>();
  private userEmail = "user@example.com"; // This should come from user settings/auth

  private constructor() {
    this.setupPeriodicChecks();
  }

  static getInstance(): NotificationScheduler {
    if (!NotificationScheduler.instance) {
      NotificationScheduler.instance = new NotificationScheduler();
    }
    return NotificationScheduler.instance;
  }

  setUserEmail(email: string) {
    this.userEmail = email;
  }

  // Schedule a reminder for a task
  scheduleTaskReminder(task: import("@/src/Firebase/taskService").Task, userEmail?: string) {
    if (!task.dueDate || !task.dueTime) {
      console.log(`Cannot schedule reminder for task ${task.taskName}: missing date or time`);
      return;
    }

    const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
    const now = new Date();
    
    // Schedule reminders at different intervals
    const reminderTimes = [
      { label: "1 day before", minutes: 24 * 60 },
      { label: "1 hour before", minutes: 60 },
      { label: "15 minutes before", minutes: 15 },
      { label: "at due time", minutes: 0 }
    ];

    reminderTimes.forEach(({ label, minutes }) => {
      const reminderTime = new Date(dueDateTime.getTime() - (minutes * 60 * 1000));
      
      if (reminderTime > now) {
        const timeoutId = setTimeout(() => {
          this.sendTaskReminder(task, label);
        }, reminderTime.getTime() - now.getTime());

        // Store the timeout ID for potential cancellation
        const key = `${task.id}-${minutes}`;
        this.scheduledNotifications.set(key, timeoutId);
        
        console.log(`Scheduled reminder for "${task.taskName}" ${label} at ${reminderTime.toLocaleString()}`);
      }
    });
  }

  // Cancel all reminders for a task
  cancelTaskReminders(taskId: string) {
    const keysToDelete: string[] = [];
    
    this.scheduledNotifications.forEach((timeoutId, key) => {
      if (key.startsWith(`${taskId}-`)) {
        clearTimeout(timeoutId);
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.scheduledNotifications.delete(key));
    console.log(`Canceled ${keysToDelete.length} reminders for task ${taskId}`);
  }

  // Send a task reminder notification
  private async sendTaskReminder(task: import("@/src/Firebase/taskService").Task, reminderLabel: string) {
    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`Task Reminder: ${task.taskName}`, {
        body: `${reminderLabel} - Due: ${task.dueDate} at ${task.dueTime}`,
        icon: '/task-icon.png',
        tag: `task-${task.id}`,
        requireInteraction: true
      });
    }

    // Email notification
    await emailService.sendTaskReminderNotification({
      taskName: task.taskName,
      dueDate: task.dueDate,
      dueTime: task.dueTime,
      userEmail: this.userEmail,
      category: task.category,
      priority: task.priority
    });

    console.log(`Sent ${reminderLabel} reminder for: ${task.taskName}`);
  }

  // Request notification permission from browser
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Check for overdue tasks and send notifications
  private async checkOverdueTasks() {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !localStorage) {
        return;
      }
      
      // This would typically fetch from your database
      // For now, we'll use localStorage or sessionStorage to get tasks
      const tasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
      const now = new Date();
      
  const overdueTasks = tasks.filter((task: import("@/src/Firebase/taskService").Task) => {
        if (task.completed) return false;
        
        const dueDateTime = new Date(`${task.dueDate}T${task.dueTime || '23:59'}`);
        return dueDateTime < now;
      });

      if (overdueTasks.length > 0) {
        await emailService.sendOverdueTaskNotifications(this.userEmail, overdueTasks);
        
        // Show browser notification for overdue tasks
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`${overdueTasks.length} Overdue Tasks`, {
            body: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`,
            icon: '/task-icon.png',
            tag: 'overdue-tasks',
            requireInteraction: true
          });
        }
      }
    } catch (error) {
      console.error('Error checking overdue tasks:', error);
    }
  }

  // Set up periodic checks for overdue tasks (every hour)
  private setupPeriodicChecks() {
    setInterval(() => {
      this.checkOverdueTasks();
    }, 60 * 60 * 1000); // Check every hour

    // Initial check
    setTimeout(() => this.checkOverdueTasks(), 5000); // Check after 5 seconds
  }

  // Send daily digest at a specific time
  scheduleDailyDigest(hour: number = 8) { // Default 8 AM
    const now = new Date();
    const nextDigest = new Date();
    nextDigest.setHours(hour, 0, 0, 0);
    
    if (nextDigest <= now) {
      nextDigest.setDate(nextDigest.getDate() + 1);
    }

    const timeUntilDigest = nextDigest.getTime() - now.getTime();
    
    setTimeout(() => {
      this.sendDailyDigest();
      
      // Schedule for next day
      setInterval(() => {
        this.sendDailyDigest();
      }, 24 * 60 * 60 * 1000);
      
    }, timeUntilDigest);
  }

  private async sendDailyDigest() {
    try {
      // Check if we're in browser environment
      if (typeof window === 'undefined' || !localStorage) {
        return;
      }
      
      // Get today's and upcoming tasks
      const tasks = JSON.parse(localStorage.getItem('allTasks') || '[]');
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
  const todayTasks = tasks.filter((task: import("@/src/Firebase/taskService").Task) => 
        !task.completed && task.dueDate === today.toISOString().split('T')[0]
      );
      
  const upcomingTasks = tasks.filter((task: import("@/src/Firebase/taskService").Task) => {
        const taskDate = new Date(task.dueDate);
        return !task.completed && taskDate > today && taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      });

      await emailService.sendDailyTaskDigest(this.userEmail, [...todayTasks, ...upcomingTasks]);
    } catch (error) {
      console.error('Error sending daily digest:', error);
    }
  }
}

export default NotificationScheduler.getInstance();