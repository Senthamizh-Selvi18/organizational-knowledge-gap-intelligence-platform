import { useEffect, useMemo, useState } from "react";
import {
  FiSun,
  FiMoon,
  FiBell,
  FiBellOff,
  FiLayout,
  FiGrid,
  FiList,
  FiVideo,
  FiBook,
  FiTarget,
  FiInfo,
  FiCheck,
  FiRotateCcw,
} from "react-icons/fi";
import DashboardLayout from "../../components/layout/DashboardLayout";

const STORAGE_KEY = "userSettings";
const PLATFORM_VERSION = "v1.0.0";

const DEFAULT_SETTINGS = {
  theme: "light",
  notificationsEnabled: true,
  dashboardLayout: "comfortable",
  visibleCards: {
    statistics: true,
    skillsOverview: true,
    recentActivity: true,
    notifications: true,
    recommendations: true,
  },
  learningPreference: "videos",
};

const DASHBOARD_CARDS = [
  { key: "statistics", label: "Statistics Overview", description: "Headline counts and key numbers" },
  { key: "skillsOverview", label: "Skills Overview", description: "Your tracked skills at a glance" },
  { key: "recentActivity", label: "Recent Activity", description: "Latest actions across the platform" },
  { key: "notifications", label: "Notifications", description: "Recent alerts and updates" },
  { key: "recommendations", label: "Recommendations", description: "AI-suggested learning paths" },
];

const LEARNING_OPTIONS = [
  { key: "videos", label: "Videos", description: "Learn through video tutorials", icon: FiVideo },
  { key: "documentation", label: "Documentation", description: "Read guides and written docs", icon: FiBook },
  { key: "practice", label: "Practice", description: "Hands-on exercises and tasks", icon: FiTarget },
];

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        ...DEFAULT_SETTINGS,
        theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
      };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      visibleCards: {
        ...DEFAULT_SETTINGS.visibleCards,
        ...(parsed.visibleCards || {}),
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 flex-none rounded-full transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-6 shadow-lg">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-primary-tint text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-text">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-sub">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Settings() {
  const [saved, setSaved] = useState(loadSettings);
  const [draft, setDraft] = useState(saved);
  const [showSavedBanner, setShowSavedBanner] = useState(false);

  // Live-preview the theme while editing, but only persist on Save.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", draft.theme === "dark");
  }, [draft.theme]);

useEffect(() => {
  window.dispatchEvent(new CustomEvent("layoutchange", { detail: draft.dashboardLayout }));
}, [draft.dashboardLayout]);

  useEffect(() => {
    if (!showSavedBanner) return;
    const t = setTimeout(() => setShowSavedBanner(false), 2500);
    return () => clearTimeout(t);
  }, [showSavedBanner]);

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved]
  );

  const updateDraft = (patch) => setDraft((prev) => ({ ...prev, ...patch }));

  const toggleCard = (key) => {
    setDraft((prev) => ({
      ...prev,
      visibleCards: { ...prev.visibleCards, [key]: !prev.visibleCards[key] },
    }));
  };

  const handleSave = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  localStorage.setItem("theme", draft.theme);
  document.documentElement.classList.toggle("dark", draft.theme === "dark");
  window.dispatchEvent(new Event("themechange"));
  window.dispatchEvent(new CustomEvent("layoutchange", { detail: draft.dashboardLayout })); // ← নতুন লাইন
  setSaved(draft);
  setShowSavedBanner(true);
};

const handleCancel = () => {
  setDraft(saved);
  document.documentElement.classList.toggle("dark", saved.theme === "dark");
  window.dispatchEvent(new CustomEvent("layoutchange", { detail: saved.dashboardLayout })); // ← নতুন লাইন
};

  return (
    <DashboardLayout>
      <div className="h-full space-y-6 overflow-y-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-text">Settings</h1>
          <p className="text-sub">Customize how the platform looks and works for you</p>
        </div>

        {/* Theme */}
        <SectionCard icon={FiSun} title="Theme" description="Choose how the interface should look">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: "light", label: "Light", icon: FiSun },
              { key: "dark", label: "Dark", icon: FiMoon },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => updateDraft({ theme: key })}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  draft.theme === key
                    ? "border-primary bg-primary-tint text-primary"
                    : "border-line text-sub hover:border-primary hover:text-primary"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
                {draft.theme === key && <FiCheck className="ml-auto h-4 w-4" />}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          icon={draft.notificationsEnabled ? FiBell : FiBellOff}
          title="Notifications"
          description="Get notified about updates relevant to you"
        >
          <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
            <div>
              <p className="font-medium text-text">Enable Notifications</p>
              <p className="text-sm text-sub">Receive alerts for messages, gaps, and recommendations</p>
            </div>
            <ToggleSwitch
              checked={draft.notificationsEnabled}
              onChange={(val) => updateDraft({ notificationsEnabled: val })}
              label="Enable Notifications"
            />
          </div>
        </SectionCard>

        {/* Dashboard Layout */}
        <SectionCard icon={FiLayout} title="Dashboard Layout" description="Control the density of your dashboard">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { key: "comfortable", label: "Comfortable", desc: "More spacing, larger cards", icon: FiGrid },
              { key: "compact", label: "Compact", desc: "Denser layout, more on screen", icon: FiList },
            ].map(({ key, label, desc, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => updateDraft({ dashboardLayout: key })}
                className={`flex flex-col items-start gap-2 rounded-xl border px-4 py-3 text-left transition-colors ${
                  draft.dashboardLayout === key
                    ? "border-primary bg-primary-tint"
                    : "border-line hover:border-primary"
                }`}
              >
                <span className="flex w-full items-center gap-2">
                  <Icon className={`h-5 w-5 ${draft.dashboardLayout === key ? "text-primary" : "text-sub"}`} />
                  <span className={`font-medium ${draft.dashboardLayout === key ? "text-primary" : "text-text"}`}>
                    {label}
                  </span>
                  {draft.dashboardLayout === key && <FiCheck className="ml-auto h-4 w-4 text-primary" />}
                </span>
                <span className="text-sm text-sub">{desc}</span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Dashboard Cards */}
        <SectionCard icon={FiGrid} title="Show Dashboard Cards" description="Choose which cards appear on your dashboard">
          <div className="grid gap-3 sm:grid-cols-2">
            {DASHBOARD_CARDS.map(({ key, label, description }) => (
              <label
                key={key}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-4 py-3 transition-colors hover:border-primary"
              >
                <input
                  type="checkbox"
                  checked={!!draft.visibleCards[key]}
                  onChange={() => toggleCard(key)}
                  className="mt-0.5 h-4 w-4 flex-none rounded border-line text-primary focus:ring-primary"
                />
                <span>
                  <span className="block font-medium text-text">{label}</span>
                  <span className="block text-sm text-sub">{description}</span>
                </span>
              </label>
            ))}
          </div>
        </SectionCard>

        {/* Learning Preference */}
        <SectionCard icon={FiTarget} title="Learning Preference" description="How would you like to close your skill gaps?">
          <div className="grid gap-3 sm:grid-cols-3">
            {LEARNING_OPTIONS.map(({ key, label, description, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => updateDraft({ learningPreference: key })}
                className={`flex flex-col items-start gap-2 rounded-xl border px-4 py-3 text-left transition-colors ${
                  draft.learningPreference === key
                    ? "border-primary bg-primary-tint"
                    : "border-line hover:border-primary"
                }`}
              >
                <span className="flex w-full items-center gap-2">
                  <Icon className={`h-5 w-5 ${draft.learningPreference === key ? "text-primary" : "text-sub"}`} />
                  <span className={`font-medium ${draft.learningPreference === key ? "text-primary" : "text-text"}`}>
                    {label}
                  </span>
                  {draft.learningPreference === key && <FiCheck className="ml-auto h-4 w-4 text-primary" />}
                </span>
                <span className="text-sm text-sub">{description}</span>
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Platform Version */}
        <SectionCard icon={FiInfo} title="Platform Version" description="Current version of the application">
          <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
            <span className="text-sm text-sub">Organizational Knowledge Gap Intelligence Platform</span>
            <span className="rounded-full bg-primary-tint px-3 py-1 font-mono text-xs font-semibold text-primary">
              {PLATFORM_VERSION}
            </span>
          </div>
        </SectionCard>

        {/* Save / Cancel */}
        <div className="sticky bottom-0 -mx-6 border-t border-line bg-bg/95 px-6 py-4 backdrop-blur-xl lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-sub">
              {showSavedBanner ? (
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <FiCheck className="h-4 w-4" /> Settings saved
                </span>
              ) : isDirty ? (
                "You have unsaved changes"
              ) : (
                "All changes saved"
              )}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!isDirty}
                className="flex items-center gap-2 rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-sub transition-colors hover:bg-primary-tint hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiRotateCcw className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!isDirty}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiCheck className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}