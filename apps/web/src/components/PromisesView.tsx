import { CheckCircle2, ExternalLink, MapPinned, PauseCircle } from "lucide-react";
import { useState } from "react";
import type { DeviceUserId, PlanPayload } from "../api/client";
import { appleMapsUrl, hasCompleteRoute, type DemoUser, type PromisePlan } from "../state/demoSession";

type PromisesViewProps = {
  actingDeviceUserId: DeviceUserId;
  plans: PromisePlan[];
  users: DemoUser[];
  onCreatePlan: (payload: PlanPayload) => void;
  onCompletePlan: (planId: string) => void;
  onPostponePlan: (planId: string, newScheduledAt: string, postponeReason: string) => void;
};

type PlanDraft = {
  title: string;
  type: PlanPayload["type"];
  scheduledAt: string;
  startPlaceText: string;
  destinationText: string;
  startLatitude: string;
  startLongitude: string;
  destinationLatitude: string;
  destinationLongitude: string;
  notes: string;
};

const emptyPlan: PlanDraft = {
  title: "",
  type: "date",
  scheduledAt: "2026-08-16T18:00",
  startPlaceText: "",
  destinationText: "",
  startLatitude: "",
  startLongitude: "",
  destinationLatitude: "",
  destinationLongitude: "",
  notes: ""
};

function optionalNumber(value: string): number | undefined {
  const parsed = Number(value);
  return value.trim() === "" || Number.isNaN(parsed) ? undefined : parsed;
}

export default function PromisesView({
  actingDeviceUserId,
  plans,
  users,
  onCreatePlan,
  onCompletePlan,
  onPostponePlan
}: PromisesViewProps) {
  const [draft, setDraft] = useState<PlanDraft>(emptyPlan);
  const [postponePlanId, setPostponePlanId] = useState<string | null>(null);
  const [newScheduledAt, setNewScheduledAt] = useState("2026-08-20T19:00");
  const [postponeReason, setPostponeReason] = useState("Need a calmer evening.");

  function updateDraft<K extends keyof PlanDraft>(field: K, value: PlanDraft[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function submitPlan() {
    if (!draft.title.trim() || !draft.destinationText.trim()) return;
    onCreatePlan({
      title: draft.title.trim(),
      type: draft.type,
      scheduledAt: draft.scheduledAt,
      ownerDeviceUserId: actingDeviceUserId,
      startPlaceText: draft.startPlaceText.trim(),
      destinationText: draft.destinationText.trim(),
      startLatitude: optionalNumber(draft.startLatitude),
      startLongitude: optionalNumber(draft.startLongitude),
      destinationLatitude: optionalNumber(draft.destinationLatitude),
      destinationLongitude: optionalNumber(draft.destinationLongitude),
      notes: draft.notes.trim()
    });
    setDraft(emptyPlan);
  }

  return (
    <section className="view-stack">
      <div className="view-header">
        <div>
          <p className="eyebrow">Shared plans</p>
          <h2>Promises</h2>
        </div>
        <span className="status-pill">Calendar-first review</span>
      </div>

      <div className="two-column wide-left">
        <section className="panel">
          <div className="section-title">
            <h3>Create a promise</h3>
            <span className="muted-text">Manual place text plus optional coordinates</span>
          </div>
          <div className="form-grid">
            <label>
              Title
              <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="Dinner after demo" />
            </label>
            <label>
              Type
              <select value={draft.type} onChange={(event) => updateDraft("type", event.target.value as PlanPayload["type"])}>
                <option value="date">Date</option>
                <option value="anniversary">Anniversary</option>
                <option value="joint_task">Joint task</option>
              </select>
            </label>
            <label>
              Scheduled
              <input type="datetime-local" value={draft.scheduledAt} onChange={(event) => updateDraft("scheduledAt", event.target.value)} />
            </label>
            <label>
              Start place
              <input value={draft.startPlaceText} onChange={(event) => updateDraft("startPlaceText", event.target.value)} />
            </label>
            <label>
              Destination
              <input value={draft.destinationText} onChange={(event) => updateDraft("destinationText", event.target.value)} />
            </label>
            <label>
              Start lat
              <input inputMode="decimal" value={draft.startLatitude} onChange={(event) => updateDraft("startLatitude", event.target.value)} />
            </label>
            <label>
              Start lon
              <input inputMode="decimal" value={draft.startLongitude} onChange={(event) => updateDraft("startLongitude", event.target.value)} />
            </label>
            <label>
              Destination lat
              <input
                inputMode="decimal"
                value={draft.destinationLatitude}
                onChange={(event) => updateDraft("destinationLatitude", event.target.value)}
              />
            </label>
            <label>
              Destination lon
              <input
                inputMode="decimal"
                value={draft.destinationLongitude}
                onChange={(event) => updateDraft("destinationLongitude", event.target.value)}
              />
            </label>
            <label className="span-two">
              Notes
              <textarea value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} />
            </label>
          </div>
          <button className="primary-button" type="button" onClick={submitPlan}>
            <MapPinned size={17} />
            Add promise
          </button>
        </section>

        <section className="plan-list">
          {plans.map((plan) => {
            const owner = users.find((user) => user.deviceUserId === plan.ownerDeviceUserId);
            const completeRoute = hasCompleteRoute(plan);

            return (
              <article key={plan.id} className="plan-card">
                <div className={`route-cover ${completeRoute ? "has-route" : ""}`}>
                  <MapPinned size={22} />
                  <span>{completeRoute ? "Route coordinates ready" : "Fallback cover: coordinates incomplete"}</span>
                </div>
                <div className="plan-body">
                  <div className="row-heading">
                    <h3>{plan.title}</h3>
                    <span className={`status-tag status-${plan.status}`}>{plan.status.replace("_", " ")}</span>
                  </div>
                  <p className="muted-text">
                    {plan.scheduledAt} · owner {owner?.displayName ?? "Unknown"}
                  </p>
                  <p>
                    {plan.startPlaceText || "Start TBD"} → {plan.destinationText}
                  </p>
                  <div className="inline-metrics">
                    <span>
                      Start {plan.startLatitude ?? "?"}, {plan.startLongitude ?? "?"}
                    </span>
                    <span>
                      Destination {plan.destinationLatitude ?? "?"}, {plan.destinationLongitude ?? "?"}
                    </span>
                  </div>
                  {plan.notes && <p className="note-text">{plan.notes}</p>}
                  {postponePlanId === plan.id && (
                    <div className="postpone-box">
                      <input type="datetime-local" value={newScheduledAt} onChange={(event) => setNewScheduledAt(event.target.value)} />
                      <input value={postponeReason} onChange={(event) => setPostponeReason(event.target.value)} />
                      <button type="button" onClick={() => onPostponePlan(plan.id, newScheduledAt, postponeReason)}>
                        Save postpone
                      </button>
                    </div>
                  )}
                  <div className="card-actions">
                    <a className="secondary-button" href={appleMapsUrl(plan)} target="_blank" rel="noreferrer">
                      <ExternalLink size={16} />
                      Apple Maps
                    </a>
                    <button className="secondary-button" type="button" onClick={() => onCompletePlan(plan.id)}>
                      <CheckCircle2 size={16} />
                      Complete
                    </button>
                    <button className="secondary-button" type="button" onClick={() => setPostponePlanId(plan.id)}>
                      <PauseCircle size={16} />
                      Postpone
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </section>
  );
}
