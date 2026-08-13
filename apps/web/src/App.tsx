import { useMemo, useState } from "react";
import AppShell, { type AppTab } from "./components/AppShell";
import PromisesView from "./components/PromisesView";
import ReviewView from "./components/ReviewView";
import TodayView from "./components/TodayView";
import UsView from "./components/UsView";
import type { DeviceUserId, PlanPayload } from "./api/client";
import {
  calculateMetrics,
  completePlan,
  createInitialDemoState,
  createPlan,
  getActingUser,
  postponePlan,
  upsertDailySync,
  type DailySync
} from "./state/demoSession";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [actingDeviceUserId, setActingDeviceUserId] = useState<DeviceUserId>("alice-device");
  const [state, setState] = useState(createInitialDemoState);
  const actingUser = getActingUser(state, actingDeviceUserId);
  const metrics = useMemo(() => calculateMetrics(state), [state]);

  function handleDailySync(sync: Omit<DailySync, "id" | "updatedAt">) {
    setState((current) => upsertDailySync(current, sync));
  }

  function handleCreatePlan(payload: PlanPayload) {
    setState((current) => createPlan(current, payload));
  }

  function handleCompletePlan(planId: string) {
    setState((current) => completePlan(current, planId));
  }

  function handlePostponePlan(planId: string, newScheduledAt: string, postponeReason: string) {
    setState((current) => postponePlan(current, planId, newScheduledAt, postponeReason));
  }

  function handleResetDemo() {
    setState(createInitialDemoState());
    setActingDeviceUserId("alice-device");
    setActiveTab("today");
  }

  return (
    <AppShell
      activeTab={activeTab}
      actingUser={actingUser}
      metrics={metrics}
      serviceStatus={state.serviceStatus}
      onTabChange={setActiveTab}
    >
      {activeTab === "today" && (
        <TodayView
          actingDeviceUserId={actingDeviceUserId}
          state={state}
          onActingDeviceUserIdChange={setActingDeviceUserId}
          onUpsertDailySync={handleDailySync}
        />
      )}
      {activeTab === "promises" && (
        <PromisesView
          actingDeviceUserId={actingDeviceUserId}
          plans={state.plans}
          users={state.users}
          onCreatePlan={handleCreatePlan}
          onCompletePlan={handleCompletePlan}
          onPostponePlan={handlePostponePlan}
        />
      )}
      {activeTab === "review" && <ReviewView actingDeviceUserId={actingDeviceUserId} metrics={metrics} state={state} />}
      {activeTab === "us" && (
        <UsView
          actingDeviceUserId={actingDeviceUserId}
          metrics={metrics}
          state={state}
          onActingDeviceUserIdChange={setActingDeviceUserId}
          onResetDemo={handleResetDemo}
        />
      )}
    </AppShell>
  );
}
