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
  { id: "today", label: "今日同步", icon: Home },
  { id: "promises", label: "约定计划", icon: CalendarCheck },
  { id: "review", label: "关系回顾", icon: HeartPulse },
  { id: "us", label: "我们的空间", icon: Sparkles }
];

const serviceStatusLabels: Record<string, string> = {
  "local-demo": "本地演示",
  "backend-ready": "后端已连接"
};

export default function AppShell({ activeTab, actingUser, metrics, serviceStatus, children, onTabChange }: AppShellProps) {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">HS</div>
          <div>
            <p className="eyebrow">HeartSync</p>
            <h1>恋爱节奏复盘</h1>
          </div>
        </div>

        <nav className="tab-list" aria-label="HeartSync 功能区">
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
          <p className="eyebrow">当前视角</p>
          <div className="user-chip">
            <span className="avatar-dot" style={{ background: actingUser.avatarColor }} />
            <strong>{actingUser.displayName}</strong>
          </div>
          <div className="mini-metrics">
            <span>关系温度</span>
            <strong>{metrics.relationshipTemperature}</strong>
          </div>
          <div className="mini-metrics">
            <span>同步率</span>
            <strong>{metrics.syncRate}%</strong>
          </div>
        </section>

        <div className="status-pill">
          <RefreshCcw size={15} />
          <span>{serviceStatusLabels[serviceStatus] ?? serviceStatus}</span>
        </div>
      </aside>

      <main className="main-panel">{children}</main>
    </div>
  );
}
