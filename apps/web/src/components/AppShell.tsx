import type { ComponentType, ReactNode } from "react";
import { CalendarCheck, HeartPulse, Home, RefreshCcw, Sparkles } from "lucide-react";
import type { DemoUser, Metrics } from "../state/demoSession";

export type AppTab = "today" | "promises" | "review" | "us";

type AppShellProps = {
  activeTab: AppTab;
  actingUser: DemoUser;
  metrics: Metrics;
  serviceStatus: string;
  children: ReactNode;
  onTabChange: (tab: AppTab) => void;
};

const tabs: Array<{ id: AppTab; label: string; icon: ComponentType<{ size?: number }> }> = [
  { id: "today", label: "Today", icon: Home },
  { id: "promises", label: "Promises", icon: CalendarCheck },
  { id: "review", label: "Review", icon: HeartPulse },
  { id: "us", label: "Us", icon: Sparkles }
];

export default function AppShell({ activeTab, actingUser, metrics, serviceStatus, children, onTabChange }: AppShellProps) {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">HS</div>
          <div>
            <p className="eyebrow">HeartSync</p>
            <h1>Couple Review</h1>
          </div>
        </div>

        <nav className="tab-list" aria-label="HeartSync sections">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? "is-active" : ""}`}
                type="button"
                onClick={() => onTabChange(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <section className="side-panel">
          <p className="eyebrow">Acting user</p>
          <div className="user-chip">
            <span className="avatar-dot" style={{ background: actingUser.avatarColor }} />
            <strong>{actingUser.displayName}</strong>
          </div>
          <div className="mini-metrics">
            <span>Temperature</span>
            <strong>{metrics.relationshipTemperature}</strong>
          </div>
          <div className="mini-metrics">
            <span>Sync rate</span>
            <strong>{metrics.syncRate}%</strong>
          </div>
        </section>

        <div className="status-pill">
          <RefreshCcw size={15} />
          <span>{serviceStatus}</span>
        </div>
      </aside>

      <main className="main-panel">{children}</main>
    </div>
  );
}
