// Email notification service with multiple provider support
// Supports EmailJS, Web3Forms, or custom API endpoints

interface TaskCompletionEmailData {
  taskName: string;
  completedAt: Date;
  userEmail: string;
  category?: string;
  priority?: 'High' | 'Medium' | 'Low';
}

interface TaskReminderEmailData {
  taskName: string;
  dueDate: string;
  dueTime?: string;
  userEmail: string;
  category?: string;
  priority?: 'High' | 'Medium' | 'Low';
}

interface EmailConfig {
  provider: 'emailjs' | 'web3forms' | 'custom' | 'mock';
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
  accessKey?: string;
  apiEndpoint?: string;
}

class EmailNotificationService {
  private static instance: EmailNotificationService;
  private config: EmailConfig = { provider: 'mock' };
  private isEmailServiceEnabled = false;

  private constructor() {}

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  // Configure email service
  configure(config: EmailConfig) {
    this.config = config;
    this.isEmailServiceEnabled = config.provider !== 'mock';
  }

  // Send email via Web3Forms (simple and free)
  private async sendViaWeb3Forms(to: string, subject: string, message: string): Promise<boolean> {
    if (!this.config.accessKey) {
      console.error('Web3Forms access key not configured');
      return false;
    }

    try {
      const formData = new FormData();
      formData.append('access_key', this.config.accessKey);
      formData.append('email', to);
      formData.append('subject', subject);
      formData.append('message', message);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Web3Forms email error:', error);
      return false;
    }
  }

  // Send email via custom API endpoint
  private async sendViaCustomAPI(to: string, subject: string, message: string): Promise<boolean> {
    if (!this.config.apiEndpoint) {
      console.error('Custom API endpoint not configured');
      return false;
    }

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          message,
          html: message.replace(/\n/g, '<br>')
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Custom API email error:', error);
      return false;
    }
  }

  // Generic send method that routes to appropriate provider
  private async sendEmail(to: string, subject: string, message: string): Promise<boolean> {
    if (!this.isEmailServiceEnabled) {
      console.log(`[EMAIL MOCK] To: ${to}\nSubject: ${subject}\nMessage: ${message}`);
      return true;
    }

    switch (this.config.provider) {
      case 'web3forms':
        return await this.sendViaWeb3Forms(to, subject, message);
      case 'custom':
        return await this.sendViaCustomAPI(to, subject, message);
      case 'emailjs':
        // EmailJS would go here if we add the dependency
        console.log('EmailJS not implemented yet - use Web3Forms or Custom API');
        return false;
      default:
        console.log(`[EMAIL MOCK] ${subject} sent to ${to}`);
        return true;
    }
  }

  async sendTaskCompletionNotification(data: TaskCompletionEmailData): Promise<boolean> {
    const subject = `🎉 Task Completed: ${data.taskName}`;
    const message = `
Congratulations! You've completed a task.

Task: ${data.taskName}
Category: ${data.category || 'General'}
Priority: ${data.priority || 'Medium'}
Completed At: ${data.completedAt.toLocaleString()}

Keep up the great work! 🚀

---
Sent from your Task Management App
    `.trim();

    return await this.sendEmail(data.userEmail, subject, message);
  }

  async sendTaskReminderNotification(data: TaskReminderEmailData): Promise<boolean> {
    const subject = `⏰ Task Reminder: ${data.taskName}`;
    const dueDateTime = data.dueTime ? 
      `${data.dueDate} at ${this.formatTime(data.dueTime)}` : 
      data.dueDate;

    const message = `
You have an upcoming task:

Task: ${data.taskName}
Due: ${dueDateTime}
Category: ${data.category || 'General'}
Priority: ${data.priority || 'Medium'}

Don't forget to complete it on time! ⚡

---
Sent from your Task Management App
    `.trim();

    return await this.sendEmail(data.userEmail, subject, message);
  }

  async sendDailyTaskDigest(userEmail: string, tasks: import("@/src/Firebase/taskService").Task[]): Promise<boolean> {
    if (tasks.length === 0) {
      return true; // No need to send empty digest
    }

    const subject = `📅 Daily Task Digest - ${tasks.length} Task${tasks.length > 1 ? 's' : ''}`;
    
    let message = `Here's your daily task summary:\n\n`;
    
    tasks.forEach((task, index) => {
      const dueTime = task.dueTime ? ` at ${this.formatTime(task.dueTime)}` : '';
      message += `${index + 1}. ${task.taskName}\n`;
      message += `   Due: ${task.dueDate}${dueTime}\n`;
      message += `   Priority: ${task.priority || 'Medium'}\n`;
      message += `   Category: ${task.category || 'General'}\n\n`;
    });

    message += `\nHave a productive day! 🎯\n\n---\nSent from your Task Management App`;

    return await this.sendEmail(userEmail, subject, message);
  }

  async sendOverdueTaskNotifications(userEmail: string, overdueTasks: import("@/src/Firebase/taskService").Task[]): Promise<boolean> {
    if (overdueTasks.length === 0) {
      return true;
    }

    const subject = `🚨 Overdue Tasks - ${overdueTasks.length} Task${overdueTasks.length > 1 ? 's' : ''} Need Attention`;
    
    let message = `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}:\n\n`;
    
    overdueTasks.forEach((task, index) => {
      const dueTime = task.dueTime ? ` at ${this.formatTime(task.dueTime)}` : '';
      message += `${index + 1}. ${task.taskName}\n`;
      message += `   Was due: ${task.dueDate}${dueTime}\n`;
      message += `   Priority: ${task.priority || 'Medium'}\n`;
      message += `   Category: ${task.category || 'General'}\n\n`;
    });

    message += `\nPlease review and complete these tasks as soon as possible.\n\n---\nSent from your Task Management App`;

    return await this.sendEmail(userEmail, subject, message);
  }

  // Helper method to format time
  private formatTime(timeString: string): string {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // Get current configuration
  getConfig(): EmailConfig {
    return { ...this.config };
  }

  // Check if email service is properly configured
  isConfigured(): boolean {
    return this.isEmailServiceEnabled;
  }
}

export default EmailNotificationService.getInstance();
export type { TaskCompletionEmailData, TaskReminderEmailData, EmailConfig };