"use client";

import { useState, useRef, useEffect } from "react";
import { User, Phone, Briefcase, FileText, Upload, Trash2, ShieldCheck, Calendar, Key, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useAuth } from "@/providers/AuthProvider";
import type { Navigate, PageId } from "@/types";
import { getErrorMessage } from "../ui/utils";
import Image from "next/image";

export function ProfilePage({ navigate }: { navigate: Navigate }) {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable fields
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [organization, setOrganization] = useState(user?.organization || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  // Hydrate editable fields once the user object is available. The AuthProvider
  // initialises user as null (hydration fix) and populates it after mount, so
  // the useState initialisers above run with null and would leave fields empty.
  // This mirrors the established hydration pattern used in AuthProvider/SettingsPage.
  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(user.name || "");
      setPhone(user.phone || "");
      setOrganization(user.organization || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  if (!user) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Please sign in to view your profile.
      </div>
    );
  }

  // Fallback Initials
  const getInitials = () => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user.email.charAt(0).toUpperCase();
  };

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!name.trim()) {
      errors.name = "Name is required.";
    } else if (name.length > 50) {
      errors.name = "Name must be less than 50 characters.";
    }

    if (phone.trim() && !/^\+?[0-9\s\-()]{7,15}$/.test(phone)) {
      errors.phone = "Invalid phone number format.";
    }

    if (organization.length > 100) {
      errors.organization = "Organization must be less than 100 characters.";
    }

    if (bio.length > 300) {
      errors.bio = "Bio must be less than 300 characters.";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!validate()) return;

    setLoading(true);
    try {
      await updateProfile({
        name,
        phone,
        organization,
        bio,
        avatar,
      });
      setSuccessMsg("Profile successfully updated.");
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err, "Failed to update profile."));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setUploadError("Unsupported image format. Please use JPEG, PNG, or WEBP.");
      return;
    }

    // Validate size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setUploadError("Image size must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar("");
    setUploadError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Account Profile</h1>
        <p className="text-xs text-muted-foreground">Manage your profile details and preferences.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Account Metadata */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center">
            {/* Avatar Preview */}
            <div className="relative w-24 h-24 rounded-full border border-border bg-sidebar flex items-center justify-center overflow-hidden mb-4 group">
              {avatar ? (
                <Image src={avatar} alt="Profile photo preview" width={96} height={96} className="w-full h-full object-cover" unoptimized />
              ) : (
                <span className="text-2xl font-bold text-sidebar-accent-foreground/75 select-none">
                  {getInitials()}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                id="avatar-upload"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[11px] font-medium rounded-lg hover:bg-muted text-foreground transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Upload size={12} /> Upload
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border text-[11px] font-medium text-destructive rounded-lg hover:bg-destructive/5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Remove profile photo"
                >
                  <Trash2 size={12} /> Remove
                </button>
              )}
            </div>

            {uploadError && (
              <p className="text-[10px] text-destructive mt-2.5 leading-normal max-w-xs">{uploadError}</p>
            )}
          </div>

          {/* Account Info Details */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Status</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5"><ShieldCheck size={13} /> Status</span>
                <span className="font-medium text-success">Active</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5"><ShieldCheck size={13} /> Verification</span>
                <span className="font-medium text-success">Verified</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5"><Calendar size={13} /> Member Since</span>
                <span className="font-medium text-foreground">{user.memberSince || "July 2026"}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={13} /> Last Login</span>
                <span className="font-medium text-foreground text-right leading-tight max-w-[130px] break-words">
                  {user.lastLogin || "Just now"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Profile Fields Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Profile Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jamie Morgan"
                  disabled={loading}
                />
                {validationErrors.name && (
                  <p className="text-[10px] text-destructive">{validationErrors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-phone">Phone Number</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                    <Phone size={14} />
                  </span>
                  <Input
                    id="profile-phone"
                    type="text"
                    className="pl-9"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    disabled={loading}
                  />
                </div>
                {validationErrors.phone && (
                  <p className="text-[10px] text-destructive">{validationErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email Address (Read Only)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                    <User size={14} />
                  </span>
                  <Input
                    id="profile-email"
                    type="email"
                    className="pl-9 bg-muted/30 text-muted-foreground border-border cursor-not-allowed select-none"
                    value={user.email}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-role">User Role (Read Only)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                    <ShieldCheck size={14} />
                  </span>
                  <Input
                    id="profile-role"
                    type="text"
                    className="pl-9 bg-muted/30 text-muted-foreground border-border capitalize cursor-not-allowed select-none"
                    value={user.role}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-org">Organization (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                  <Briefcase size={14} />
                </span>
                <Input
                  id="profile-org"
                  type="text"
                  className="pl-9"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="FIFA Event Management Team"
                  disabled={loading}
                />
              </div>
              {validationErrors.organization && (
                <p className="text-[10px] text-destructive">{validationErrors.organization}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-bio">Brief Bio (Optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-muted-foreground/60">
                  <FileText size={14} />
                </span>
                <textarea
                  id="profile-bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Add a short bio about yourself..."
                  disabled={loading}
                  className="w-full text-xs bg-input text-foreground border border-border rounded-lg pl-9 pr-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              {validationErrors.bio && (
                <p className="text-[10px] text-destructive">{validationErrors.bio}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-3 border-t border-border/60">
              {/* Navigate to change password reset flow */}
              <button
                type="button"
                onClick={() => {
                  // Direct navigation to forgot password flow
                  navigate("forgot-password" as PageId);
                }}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <Key size={13} /> Change Password
              </button>

              <Button type="submit" disabled={loading} size="lg" className="w-full sm:w-auto px-6">
                {loading ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
