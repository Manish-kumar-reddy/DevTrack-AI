import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import * as authApi from "../api/auth";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    targetCompany: user?.targetCompany || "",
    bio: user?.bio || "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileErrors({});
    setSavingProfile(true);
    try {
      await authApi.updateProfile(profileForm);
      await refreshProfile();
      toast.success("Profile updated.");
    } catch (err) {
      const details = err.response?.data?.details;
      if (details) setProfileErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordErrors({});
    setSavingPassword(true);
    try {
      await authApi.changePassword(passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "" });
      toast.success("Password changed successfully.");
    } catch (err) {
      const details = err.response?.data?.details;
      if (details) setPasswordErrors(Object.fromEntries(details.map((d) => [d.field, d.message])));
      toast.error(err.response?.data?.message || "Failed to change password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your account details.</p>
      </div>

      <form onSubmit={handleProfileSubmit} className="card space-y-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Edit Profile</h2>
        <div>
          <label className="label">Full Name</label>
          <input className="input" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
          {profileErrors.name && <p className="mt-1 text-xs text-red-500">{profileErrors.name}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input opacity-60" value={user?.email} disabled />
        </div>
        <div>
          <label className="label">Target Company</label>
          <input
            className="input"
            value={profileForm.targetCompany}
            onChange={(e) => setProfileForm({ ...profileForm, targetCompany: e.target.value })}
            placeholder="e.g. Google"
          />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea
            className="input min-h-[80px] resize-y"
            value={profileForm.bio}
            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            placeholder="A short bio..."
          />
          {profileErrors.bio && <p className="mt-1 text-xs text-red-500">{profileErrors.bio}</p>}
        </div>
        <button type="submit" className="btn-primary" disabled={savingProfile}>
          {savingProfile ? "Saving..." : "Save changes"}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card space-y-4">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Change Password</h2>
        <div>
          <label className="label">Current Password</label>
          <input
            type="password"
            className="input"
            required
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          />
          {passwordErrors.currentPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.currentPassword}</p>}
        </div>
        <div>
          <label className="label">New Password</label>
          <input
            type="password"
            className="input"
            required
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />
          {passwordErrors.newPassword && <p className="mt-1 text-xs text-red-500">{passwordErrors.newPassword}</p>}
        </div>
        <button type="submit" className="btn-primary" disabled={savingPassword}>
          {savingPassword ? "Updating..." : "Update password"}
        </button>
      </form>
    </div>
  );
}
