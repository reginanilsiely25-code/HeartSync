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

const planTypeLabels: Record<PlanPayload["type"], string> = {
  date: "约会",
  anniversary: "纪念日",
  joint_task: "共同任务"
};

const planStatusLabels: Record<string, string> = {
  not_started: "未开始",
  in_progress: "进行中",
  completed: "已完成",
  postponed: "已延期"
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
  const [postponeReason, setPostponeReason] = useState("想换一个更从容的晚上。");

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
          <p className="eyebrow">共同约定</p>
          <h2>约定计划</h2>
        </div>
        <span className="status-pill">日历优先复盘</span>
      </div>

      <div className="two-column wide-left">
        <section className="panel">
          <div className="section-title">
            <h3>创建约定</h3>
            <span className="muted-text">地点文字必填，坐标可选</span>
          </div>
          <div className="form-grid">
            <label>
              标题
              <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="演示结束后的晚餐" />
            </label>
            <label>
              类型
              <select value={draft.type} onChange={(event) => updateDraft("type", event.target.value as PlanPayload["type"])}>
                {Object.entries(planTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              时间
              <input type="datetime-local" value={draft.scheduledAt} onChange={(event) => updateDraft("scheduledAt", event.target.value)} />
            </label>
            <label>
              出发地
              <input value={draft.startPlaceText} onChange={(event) => updateDraft("startPlaceText", event.target.value)} />
            </label>
            <label>
              目的地
              <input value={draft.destinationText} onChange={(event) => updateDraft("destinationText", event.target.value)} />
            </label>
            <label>
              出发纬度
              <input inputMode="decimal" value={draft.startLatitude} onChange={(event) => updateDraft("startLatitude", event.target.value)} />
            </label>
            <label>
              出发经度
              <input inputMode="decimal" value={draft.startLongitude} onChange={(event) => updateDraft("startLongitude", event.target.value)} />
            </label>
            <label>
              目的地纬度
              <input
                inputMode="decimal"
                value={draft.destinationLatitude}
                onChange={(event) => updateDraft("destinationLatitude", event.target.value)}
              />
            </label>
            <label>
              目的地经度
              <input
                inputMode="decimal"
                value={draft.destinationLongitude}
                onChange={(event) => updateDraft("destinationLongitude", event.target.value)}
              />
            </label>
            <label className="span-two">
              备注
              <textarea value={draft.notes} onChange={(event) => updateDraft("notes", event.target.value)} />
            </label>
          </div>
          <button className="primary-button" type="button" onClick={submitPlan}>
            <MapPinned size={17} />
            添加约定
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
                  <span>{completeRoute ? "路线坐标已就绪" : "坐标不完整，使用默认封面"}</span>
                </div>
                <div className="plan-body">
                  <div className="row-heading">
                    <h3>{plan.title}</h3>
                    <span className={`status-tag status-${plan.status}`}>{planStatusLabels[plan.status]}</span>
                  </div>
                  <p className="muted-text">
                    {plan.scheduledAt} · 负责人 {owner?.displayName ?? "未知"}
                  </p>
                  <p>
                    {plan.startPlaceText || "未填写出发地"} → {plan.destinationText}
                  </p>
                  <div className="inline-metrics">
                    <span>
                      出发 {plan.startLatitude ?? "?"}, {plan.startLongitude ?? "?"}
                    </span>
                    <span>
                      目的地 {plan.destinationLatitude ?? "?"}, {plan.destinationLongitude ?? "?"}
                    </span>
                  </div>
                  {plan.notes && <p className="note-text">{plan.notes}</p>}
                  {postponePlanId === plan.id && (
                    <div className="postpone-box">
                      <input type="datetime-local" value={newScheduledAt} onChange={(event) => setNewScheduledAt(event.target.value)} />
                      <input value={postponeReason} onChange={(event) => setPostponeReason(event.target.value)} />
                      <button type="button" onClick={() => onPostponePlan(plan.id, newScheduledAt, postponeReason)}>
                        保存延期
                      </button>
                    </div>
                  )}
                  <div className="card-actions">
                    <a className="secondary-button" href={appleMapsUrl(plan)} target="_blank" rel="noreferrer">
                      <ExternalLink size={16} />
                      苹果地图
                    </a>
                    <button className="secondary-button" type="button" onClick={() => onCompletePlan(plan.id)}>
                      <CheckCircle2 size={16} />
                      完成
                    </button>
                    <button className="secondary-button" type="button" onClick={() => setPostponePlanId(plan.id)}>
                      <PauseCircle size={16} />
                      延期
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
