"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { showNotification } from "../../notificationSlice";
import emailService, { EmailConfig } from "../../services/emailNotificationService";
import notificationScheduler from "../../services/notificationScheduler";
import ProtectedRoute from "../../Components/ProtectedRoute";

export default function SettingsPage() {
  const dispatch = useDispatch();
  const [userEmail, setUserEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [dailyDigestTime, setDailyDigestTime] = useState("08:00");
  const [emailProvider, setEmailProvider] = useState<'mock' | 'web3forms' | 'custom'>('mock');
  const [web3formsKey, setWeb3formsKey] = useState("");
  const [customApiEndpoint, setCustomApiEndpoint] = useState("");
  const [reminderSettings, setReminderSettings] = useState({
    oneDayBefore: true,
    oneHourBefore: true,
    fifteenMinBefore: true,
    atDueTime: true
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedEmail = localStorage.getItem("userEmail") || "";
    const savedEmailNotif = localStorage.getItem("emailNotifications") !== "false";
    const savedBrowserNotif = localStorage.getItem("browserNotifications") === "true";
    const savedDigestTime = localStorage.getItem("dailyDigestTime") || "08:00";
    const savedEmailProvider = (localStorage.getItem("emailProvider") as 'mock' | 'web3forms' | 'custom') || 'mock';
    const savedWeb3formsKey = localStorage.getItem("web3formsKey") || "";
    const savedCustomApi = localStorage.getItem("customApiEndpoint") || "";

    setUserEmail(savedEmail);
    setEmailNotifications(savedEmailNotif);
    setBrowserNotifications(savedBrowserNotif);
    setDailyDigestTime(savedDigestTime);
    setEmailProvider(savedEmailProvider);
    setWeb3formsKey(savedWeb3formsKey);
    setCustomApiEndpoint(savedCustomApi);

    // Check current browser notification permission
    if ('Notification' in window) {
      setBrowserNotifications(Notification.permission === 'granted');
    }
  }, []);

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("emailNotifications", emailNotifications.toString());
    localStorage.setItem("browserNotifications", browserNotifications.toString());
    localStorage.setItem("dailyDigestTime", dailyDigestTime);
    localStorage.setItem("emailProvider", emailProvider);
    localStorage.setItem("web3formsKey", web3formsKey);
    localStorage.setItem("customApiEndpoint", customApiEndpoint);

    // Configure email service
    const emailConfig: EmailConfig = {
      provider: emailProvider,
      ...(emailProvider === 'web3forms' && { accessKey: web3formsKey }),
      ...(emailProvider === 'custom' && { apiEndpoint: customApiEndpoint })
    };
    
    emailService.configure(emailConfig);
    notificationScheduler.setUserEmail(userEmail);

    dispatch(showNotification({
      message: "Settings saved successfully!",
      type: 'success'
    }));
  };

  const handleRequestBrowserPermission = async () => {
    const hasPermission = await notificationScheduler.requestNotificationPermission();
    setBrowserNotifications(hasPermission);
    
    if (hasPermission) {
      dispatch(showNotification({
        message: "Browser notifications enabled!",
        type: 'success'
      }));
    } else {
      dispatch(showNotification({
        message: "Browser notifications permission denied",
        type: 'error'
      }));
    }
  };

  const testNotifications = async () => {
    if (browserNotifications) {
      new Notification("Test Notification", {
        body: "Your task notifications are working correctly!",
        icon: '/task-icon.png'
      });
    }

    if (emailNotifications && userEmail) {
      await emailService.sendTaskReminderNotification({
        taskName: "Test Task",
        dueDate: new Date().toISOString().split('T')[0],
        dueTime: "10:00",
        userEmail: userEmail
      });
    }

    dispatch(showNotification({
      message: "Test notifications sent!",
      type: 'success'
    }));
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      {/* Email Settings */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Email Notifications</h2>
        
        <div className="mb-4">
          <label className="block text-gray-300 font-medium text-sm mb-2">Email Address</label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="emailNotifications"
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            className="mr-3 accent-blue-500"
          />
          <label htmlFor="emailNotifications" className="text-gray-300">
            Enable email notifications for task reminders and completions
          </label>
        </div>

        {emailNotifications && (
          <>
            <div className="mb-4">
              <label className="block text-gray-300 font-medium text-sm mb-2">Email Provider</label>
              <select
                value={emailProvider}
                onChange={(e) => setEmailProvider(e.target.value as 'mock' | 'web3forms' | 'custom')}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
              >
                <option value="mock">Mock (Console Only)</option>
                <option value="web3forms">Web3Forms (Free)</option>
                <option value="custom">Custom API</option>
              </select>
            </div>

            {emailProvider === 'web3forms' && (
              <div className="mb-4">
                <label className="block text-gray-300 font-medium text-sm mb-2">Web3Forms Access Key</label>
                <input
                  type="password"
                  value={web3formsKey}
                  onChange={(e) => setWeb3formsKey(e.target.value)}
                  placeholder="Your Web3Forms access key"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Get your free access key from <a href="https://web3forms.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">web3forms.com</a>
                </p>
              </div>
            )}

            {emailProvider === 'custom' && (
              <div className="mb-4">
                <label className="block text-gray-300 font-medium text-sm mb-2">Custom API Endpoint</label>
                <input
                  type="url"
                  value={customApiEndpoint}
                  onChange={(e) => setCustomApiEndpoint(e.target.value)}
                  placeholder="https://your-api.com/send-email"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Endpoint should accept POST requests with to, subject, and message fields
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Browser Notifications */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Browser Notifications</h2>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-gray-300 mb-1">Browser Notifications</div>
            <div className="text-gray-500 text-sm">
              Status: {browserNotifications ? "Enabled" : "Disabled"}
            </div>
          </div>
          {!browserNotifications && (
            <button
              onClick={handleRequestBrowserPermission}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Enable
            </button>
          )}
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Reminder Settings</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {Object.entries(reminderSettings).map(([key, enabled]) => (
            <div key={key} className="flex items-center">
              <input
                type="checkbox"
                id={key}
                checked={enabled}
                onChange={(e) => setReminderSettings({
                  ...reminderSettings,
                  [key]: e.target.checked
                })}
                className="mr-3 accent-blue-500"
              />
              <label htmlFor={key} className="text-gray-300 capitalize">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </label>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 font-medium text-sm mb-2">Daily Digest Time</label>
          <input
            type="time"
            value={dailyDigestTime}
            onChange={(e) => setDailyDigestTime(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-gray-600 bg-gray-700/50 text-white text-base outline-none focus:border-blue-500 transition-colors"
            style={{ colorScheme: "dark" }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSaveSettings}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
        >
          Save Settings
        </button>
        
        <button
          onClick={testNotifications}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
        >
          Test Notifications
        </button>
      </div>

      {/* Information */}
      <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-300 font-semibold mb-2">📧 Email Integration Options</h3>
        <div className="space-y-2 text-gray-300 text-sm">
          <p><strong>Mock:</strong> Email notifications are logged to console (for development)</p>
          <p><strong>Web3Forms:</strong> Free email service - sign up at web3forms.com for an access key</p>
          <p><strong>Custom API:</strong> Use your own email API endpoint (SendGrid, Mailgun, etc.)</p>
        </div>
        <p className="text-gray-300 text-sm mt-3">
          Browser notifications work immediately once permission is granted and don&apos;t require email configuration.
        </p>
      </div>
    </div>
    </ProtectedRoute>
  );
}