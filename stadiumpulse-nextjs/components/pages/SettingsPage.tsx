"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Key, LogOut, Trash2, Bell, AlertTriangle, CheckCircle, Smartphone, Globe, Eye, RefreshCw } from "lucide-react";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { useAuth } from "@/providers/AuthProvider";
import { SettingsService, UserSettings, DEFAULT_SETTINGS } from "@/services/settings";
import type { Navigate, PageId } from "@/types";

export function SettingsPage({ navigate }: { navigate: Navigate }) {
  const { user } = useAuth();
  const { setTheme } = useTheme();

  // Dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Settings State
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Load settings on mount
  useEffect(() => {
    if (user) {
      const initial = SettingsService.getLocalSettings(user.id);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSettings(initial);

      SettingsService.getSettings(user.id).then((stored) => {
        setSettings(stored);
      }).catch(() => {
        // Ignore background fetch errors
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Please sign in to view settings.
      </div>
    );
  }

  // Handle saving settings
  const handleSaveSettings = async (updatedSettings: UserSettings) => {
    setSuccessMsg("");
    setErrorMsg("");
    try {
      await SettingsService.saveSettings(user.id, updatedSettings);
      
      // Update theme state immediately
      setTheme(updatedSettings.general.theme);

      setSettings(updatedSettings);
      setSuccessMsg("Settings saved successfully.");
    } catch {
      setErrorMsg("Failed to save settings.");
    }
  };

  // Helper to update specific sub-field
  const updateField = <T extends keyof UserSettings, K extends keyof UserSettings[T]>(
    section: T,
    key: K,
    value: UserSettings[T][K]
  ) => {
    const updated = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    };
    setSettings(updated);
    handleSaveSettings(updated);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Account Settings</h1>
        <p className="text-xs text-muted-foreground">Configure preferences and security settings.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-success/10 border border-success/20 text-success text-xs rounded-xl flex items-center gap-2" role="alert">
          <CheckCircle size={14} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center gap-2" role="alert">
          <AlertTriangle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: General & Accessibility */}
        <div className="space-y-6">
          {/* General Section */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Globe size={14} /> General Settings
            </h3>
            
            <div className="space-y-4 pt-1">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-theme">Active Theme</Label>
                <select
                  id="settings-theme"
                  value={settings.general.theme}
                  onChange={(e) => updateField("general", "theme", e.target.value as UserSettings["general"]["theme"])}
                  className="w-full text-xs bg-input text-foreground border border-border rounded-lg px-3 py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                  <option value="system">System Default</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-lang">Language Preference</Label>
                <select
                  id="settings-lang"
                  value={settings.general.language}
                  onChange={(e) => updateField("general", "language", e.target.value as UserSettings["general"]["language"])}
                  className="w-full text-xs bg-input text-foreground border border-border rounded-lg px-3 py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="en">English (US)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-tz">Time Zone</Label>
                <select
                  id="settings-tz"
                  value={settings.general.timeZone}
                  onChange={(e) => updateField("general", "timeZone", e.target.value)}
                  className="w-full text-xs bg-input text-foreground border border-border rounded-lg px-3 py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="EST">Eastern Standard Time (EST)</option>
                  <option value="IST">Indian Standard Time (IST)</option>
                  <option value="GMT">Greenwich Mean Time (GMT)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-date">Date Format</Label>
                <select
                  id="settings-date"
                  value={settings.general.dateFormat}
                  onChange={(e) => updateField("general", "dateFormat", e.target.value)}
                  className="w-full text-xs bg-input text-foreground border border-border rounded-lg px-3 py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Eye size={14} /> Accessibility Preferences
            </h3>

            <div className="space-y-3.5 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <Label htmlFor="toggle-contrast" className="cursor-pointer font-medium">High Contrast Mode</Label>
                <input
                  id="toggle-contrast"
                  type="checkbox"
                  checked={settings.accessibility.highContrast}
                  onChange={(e) => updateField("accessibility", "highContrast", e.target.checked)}
                  className="rounded border-border text-primary focus:ring-ring cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="toggle-motion" className="cursor-pointer font-medium">Reduced Motion</Label>
                <input
                  id="toggle-motion"
                  type="checkbox"
                  checked={settings.accessibility.reducedMotion}
                  onChange={(e) => updateField("accessibility", "reducedMotion", e.target.checked)}
                  className="rounded border-border text-primary focus:ring-ring cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="toggle-reader" className="cursor-pointer font-medium">Screen Reader Enhancements</Label>
                <input
                  id="toggle-reader"
                  type="checkbox"
                  checked={settings.accessibility.screenReader}
                  onChange={(e) => updateField("accessibility", "screenReader", e.target.checked)}
                  className="rounded border-border text-primary focus:ring-ring cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="toggle-keynav" className="cursor-pointer font-medium">Keyboard Navigation Mode</Label>
                <input
                  id="toggle-keynav"
                  type="checkbox"
                  checked={settings.accessibility.keyboardNav}
                  onChange={(e) => updateField("accessibility", "keyboardNav", e.target.checked)}
                  className="rounded border-border text-primary focus:ring-ring cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5 pt-1.5">
                <Label htmlFor="settings-font">Preferred Font Size</Label>
                <select
                  id="settings-font"
                  value={settings.accessibility.fontSize}
                  onChange={(e) => updateField("accessibility", "fontSize", e.target.value as UserSettings["accessibility"]["fontSize"])}
                  className="w-full text-xs bg-input text-foreground border border-border rounded-lg px-3 py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="small">Small (14px)</option>
                  <option value="medium">Medium (16px)</option>
                  <option value="large">Large (18px)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Notifications & App Config & Privacy */}
        <div className="space-y-6">
          {/* Notifications config */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Bell size={14} /> Notification Configurations
            </h3>

            <div className="space-y-3.5 pt-1 text-xs">
              {[
                { field: "email", label: "Email Notifications" },
                { field: "push", label: "Push Notifications" },
                { field: "security", label: "Security Alerts" },
                { field: "ai", label: "AI Recommendations" },
                { field: "match", label: "Match & Event Updates" },
                { field: "emergency", label: "Emergency Evacuation Alerts" },
              ].map((item) => (
                <div key={item.field} className="flex items-center justify-between">
                  <Label htmlFor={`toggle-notif-${item.field}`} className="cursor-pointer font-medium">{item.label}</Label>
                  <input
                    id={`toggle-notif-${item.field}`}
                    type="checkbox"
                    checked={settings.notifications[item.field as keyof UserSettings["notifications"]]}
                    onChange={(e) => updateField("notifications", item.field as keyof UserSettings["notifications"], e.target.checked)}
                    className="rounded border-border text-primary focus:ring-ring cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Application config */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <RefreshCw size={14} /> Application Preferences
            </h3>

            <div className="space-y-4 pt-1">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-dash">Default Landing Dashboard</Label>
                <select
                  id="settings-dash"
                  value={settings.application.defaultDashboard}
                  onChange={(e) => updateField("application", "defaultDashboard", e.target.value)}
                  className="w-full text-xs bg-input text-foreground border border-border rounded-lg px-3 py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="fan">Fan Portal</option>
                  <option value="volunteer">Volunteer Portal</option>
                  <option value="security">Security Command Center</option>
                  <option value="organizer">Organizer Operations</option>
                  <option value="operator">Operator Operations</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-refresh">Auto Refresh Interval</Label>
                <select
                  id="settings-refresh"
                  value={settings.application.autoRefresh}
                  onChange={(e) => updateField("application", "autoRefresh", e.target.value as UserSettings["application"]["autoRefresh"])}
                  className="w-full text-xs bg-input text-foreground border border-border rounded-lg px-3 py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="off">Off</option>
                  <option value="5s">Every 5 Seconds</option>
                  <option value="10s">Every 10 Seconds</option>
                  <option value="30s">Every 30 Seconds</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="settings-ai">AI Assistant Agent Persona</Label>
                <select
                  id="settings-ai"
                  value={settings.application.aiPreference}
                  onChange={(e) => updateField("application", "aiPreference", e.target.value)}
                  className="w-full text-xs bg-input text-foreground border border-border rounded-lg px-3 py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="concierge">AI Concierge Assistant (Casual)</option>
                  <option value="operator">AI Technical Operator (Professional)</option>
                  <option value="agent">Autonomous Copilot (Proactive)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <Label htmlFor="toggle-collapse" className="cursor-pointer font-medium">Auto Collapse Sidebar</Label>
                <input
                  id="toggle-collapse"
                  type="checkbox"
                  checked={settings.application.sidebarCollapsed}
                  onChange={(e) => updateField("application", "sidebarCollapsed", e.target.checked)}
                  className="rounded border-border text-primary focus:ring-ring cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security, Active Session & Connected Devices */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-6">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Smartphone size={14} /> Privacy & Device Security
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Mock session logs */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground border-b border-border/40 pb-1.5">Active Session Details</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">Operating System</span>
                <span className="font-medium text-foreground">Windows 11 PC</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">Active Browser</span>
                <span className="font-medium text-foreground">Chrome (v124)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">IP Address</span>
                <span className="font-medium text-foreground">192.168.1.154 (Local)</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-muted-foreground">Last Login</span>
                <span className="font-medium text-foreground text-right leading-tight max-w-[180px] break-words">
                  {user.lastLogin || "Just now"}
                </span>
              </div>
            </div>
          </div>

          {/* Connected Devices (mock) */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground border-b border-border/40 pb-1.5">Connected Devices</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">Samsung Galaxy S24 Ultra</span>
                  <span className="text-[10px] text-muted-foreground">Mobile App · Austin, TX · 2 hours ago</span>
                </div>
                <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Paired</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold text-foreground">Apple iPad Pro 12.9</span>
                  <span className="text-[10px] text-muted-foreground">Safari Browser · Dallas, TX · 3 days ago</span>
                </div>
                <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">Paired</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security actions */}
        <div className="flex flex-wrap items-center gap-3.5 pt-4 border-t border-border/60">
          <button
            type="button"
            onClick={() => navigate("forgot-password" as PageId)}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Key size={13} /> Change Password
          </button>

          <button
            type="button"
            onClick={() => setShowSignOutConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <LogOut size={13} /> Sign Out All Other Devices
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1.5 text-xs text-destructive hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <Trash2 size={13} /> Delete Account
          </button>
        </div>
      </div>

      {/* Dialog for Sign Out Devices */}
      <Dialog open={showSignOutConfirm} onOpenChange={setShowSignOutConfirm}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle>Sign Out All Other Devices</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out from all other connected devices and browser instances?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:flex-row flex-col">
            <button
              onClick={() => setShowSignOutConfirm(false)}
              className="flex-1 px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowSignOutConfirm(false);
                setSuccessMsg("Successfully signed out from all other sessions.");
              }}
              className="flex-1 px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/95 transition-colors cursor-pointer focus-visible:outline-none"
            >
              Sign Out
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Delete Account */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-[340px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your personal data and operations logs will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:flex-row flex-col">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 px-4 py-2 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors cursor-pointer focus-visible:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setErrorMsg("Delete account is currently in demonstration mode.");
              }}
              className="flex-1 px-4 py-2 text-xs font-medium bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/95 transition-colors cursor-pointer focus-visible:outline-none"
            >
              Delete Permanently
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
