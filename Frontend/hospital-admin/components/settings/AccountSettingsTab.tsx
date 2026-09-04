"use client";

import React, { useState } from "react";
import {
  User,
  Lock,
  Camera,
  Globe,
  Clock,
  Shield,
  LogOut,
  Laptop,
  Smartphone,
  Check,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/hospital-admin/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/hospital-admin/components/ui/card";
import { Input } from "@/hospital-admin/components/ui/input";
import { Label } from "@/hospital-admin/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/hospital-admin/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/hospital-admin/components/ui/avatar";
import { Badge } from "@/hospital-admin/components/ui/badge";
import { Switch } from "@/hospital-admin/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/hospital-admin/components/ui/table";
import { useToast } from "@/hospital-admin/hooks/use-toast";

interface SessionItem {
  id: string;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const initialSessions: SessionItem[] = [
  {
    id: "sess-1",
    device: "Windows PC / Desktop",
    browser: "Chrome 128.0 (Windows 11)",
    ip: "192.168.1.45 (Hospital Admin LAN)",
    location: "Mumbai, India",
    lastActive: "Active Now",
    isCurrent: true,
  },
  {
    id: "sess-2",
    device: "Apple iPad Pro",
    browser: "Safari 17.4 (iPadOS)",
    ip: "10.0.4.12 (Clinical Wi-Fi)",
    location: "Mumbai, India",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "sess-3",
    device: "iPhone 15 Pro",
    browser: "Qlyno Mobile Web App",
    ip: "49.36.128.91 (Cellular)",
    location: "Mumbai, India",
    lastActive: "Yesterday, 08:30 PM",
    isCurrent: false,
  },
];

export function AccountSettingsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);

  // Profile Form State
  const [profile, setProfile] = useState({
    firstName: "Akshay",
    lastName: "Sharma",
    email: "admin@qlyno.health",
    phone: "+91 98200 12345",
    designation: "Chief Medical Administrator / Hospital Admin",
    language: "en-IN",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    use24HourClock: true,
  });

  // Password Form State
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleProfileChange = (key: string, value: any) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Account Profile Saved",
        description: "Your administrator personal details and regional preferences updated.",
      });
    }, 600);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast({
        title: "Validation Error",
        description: "Please enter your current password.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation password do not match.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Updated Successfully",
      description: "Your master login password has been changed. Use it for next sign-in.",
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    toast({
      title: "Session Terminated",
      description: "The selected device session has been signed out.",
    });
  };

  const getPasswordStrength = () => {
    if (!newPassword) return 0;
    let strength = 0;
    if (newPassword.length >= 8) strength += 25;
    if (/[A-Z]/.test(newPassword)) strength += 25;
    if (/[0-9]/.test(newPassword)) strength += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();

  return (
    <div className="space-y-6">
      {/* 1. Profile Details & Avatar */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <User className="h-5 w-5 text-primary" /> Administrator Profile &amp; Contact Info
            </CardTitle>
            <CardDescription className="text-xs">
              Personal administrative identity, phone verification, and emergency escalations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar & Role Header */}
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-border pb-6">
              <div className="relative">
                <Avatar className="h-20 w-20 rounded-2xl border-2 border-primary/20 shadow-xs">
                  <AvatarImage src="https://i.pravatar.cc/150?img=68" alt={profile.firstName} />
                  <AvatarFallback className="rounded-2xl bg-primary/20 text-lg font-bold text-primary">
                    AS
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => toast({ title: "Avatar Upload", description: "Select a photo from your computer." })}
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm hover:opacity-90"
                  aria-label="Change photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-base font-bold text-foreground">
                    {profile.firstName} {profile.lastName}
                  </h4>
                  <Badge className="bg-primary/10 text-primary border-primary/30 text-[11px]">
                    Hospital Admin
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{profile.designation}</p>
                <p className="text-xs font-mono text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={profile.firstName}
                  onChange={(e) => handleProfileChange("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={profile.lastName}
                  onChange={(e) => handleProfileChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phone">Contact Mobile Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. Regional & Localization Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Globe className="h-5 w-5 text-primary" /> Regional, Language &amp; Timezone
            </CardTitle>
            <CardDescription className="text-xs">
              Preferred display language, medical record date formatting, and local timezone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="language">Display Language</Label>
                <Select
                  value={profile.language}
                  onValueChange={(v) => handleProfileChange("language", v)}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-IN">English (India - en-IN)</SelectItem>
                    <SelectItem value="en-US">English (US - en-US)</SelectItem>
                    <SelectItem value="hi-IN">Hindi (हिंदी - hi-IN)</SelectItem>
                    <SelectItem value="mr-IN">Marathi (मराठी - mr-IN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="timezone">Hospital Timezone</Label>
                <Select
                  value={profile.timezone}
                  onValueChange={(v) => handleProfileChange("timezone", v)}
                >
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST - UTC+05:30)</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai (GST - UTC+04:00)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT/BST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST/EDT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="dateFormat">Date Display Format</Label>
                <Select
                  value={profile.dateFormat}
                  onValueChange={(v) => handleProfileChange("dateFormat", v)}
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (e.g. 30/08/2026)</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/30/2026)</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3.5">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">Use 24-Hour Clinical Military Time (HH:MM)</p>
                <p className="text-xs text-muted-foreground">
                  Displays timestamps in 24-hour format across nurse station charts and OT logs (e.g. 17:30).
                </p>
              </div>
              <Switch
                checked={profile.use24HourClock}
                onCheckedChange={(c) => handleProfileChange("use24HourClock", c)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" loading={loading} className="gap-2">
                <Save className="h-4 w-4" /> Save Profile &amp; Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* 3. Password Change Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Lock className="h-5 w-5 text-primary" /> Change Admin Password
          </CardTitle>
          <CardDescription className="text-xs">
            Update your account password. Ensure it has at least 8 characters with letters, numbers, and symbols.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="currentPw">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPw"
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((s) => !s)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="newPw">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPw"
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((s) => !s)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="confirmPw">Confirm New Password</Label>
                <Input
                  id="confirmPw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Password Strength</span>
                  <span
                    className={
                      strength <= 25
                        ? "text-destructive font-semibold"
                        : strength <= 50
                        ? "text-amber-500 font-semibold"
                        : strength <= 75
                        ? "text-blue-500 font-semibold"
                        : "text-emerald-600 font-semibold"
                    }
                  >
                    {strength <= 25 ? "Weak" : strength <= 50 ? "Fair" : strength <= 75 ? "Good" : "Strong"}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength <= 25
                        ? "bg-destructive w-1/4"
                        : strength <= 50
                        ? "bg-amber-500 w-2/4"
                        : strength <= 75
                        ? "bg-blue-500 w-3/4"
                        : "bg-emerald-500 w-full"
                    }`}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="secondary" className="gap-2">
                <Shield className="h-4 w-4" /> Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 4. Active Device Sessions Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Laptop className="h-5 w-5 text-primary" /> Active Login Sessions &amp; Workstations
          </CardTitle>
          <CardDescription className="text-xs">
            Manage devices currently signed into your hospital administrator account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="text-xs font-bold">Device / Workstation</TableHead>
                  <TableHead className="text-xs font-bold">Browser &amp; OS</TableHead>
                  <TableHead className="text-xs font-bold">IP &amp; Location</TableHead>
                  <TableHead className="text-xs font-bold">Last Activity</TableHead>
                  <TableHead className="text-xs font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((sess) => (
                  <TableRow key={sess.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-semibold text-foreground flex items-center gap-2">
                      {sess.device.includes("PC") ? (
                        <Laptop className="h-4 w-4 text-primary" />
                      ) : (
                        <Smartphone className="h-4 w-4 text-primary" />
                      )}
                      <span>{sess.device}</span>
                      {sess.isCurrent && (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
                          This Device
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{sess.browser}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {sess.ip} · <span className="font-sans">{sess.location}</span>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-foreground">{sess.lastActive}</TableCell>
                    <TableCell className="text-right">
                      {sess.isCurrent ? (
                        <span className="text-[11px] text-muted-foreground italic">Current Session</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeSession(sess.id)}
                          className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10"
                        >
                          <LogOut className="h-3.5 w-3.5" /> Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
