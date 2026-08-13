import { AlertTriangle, FileText, Lock, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import type { DeviceUserId } from "../api/client";
import {
  findCard,
  getActingUser,
  latestPrivateDraftNote,
  partnerVisibleNotes,
  selectedSharedNotes,
  type DemoState,
  type Metrics
} from "../state/demoSession";

type ReviewViewProps = {
  actingDeviceUserId: DeviceUserId;
  metrics: Metrics;
  state: DemoState;
};

export default function ReviewView({ actingDeviceUserId, metrics, state }: ReviewViewProps) {
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const actingUser = getActingUser(state, actingDeviceUserId);
  const visibleNotes = useMemo(() => partnerVisibleNotes(state), [state]);
  const sharedNotes = selectedSharedNotes(state, selectedNoteIds);
  const privateDraftNote = latestPrivateDraftNote(state, actingDeviceUserId);
  const unsafeFallback = state.llmStatus === "mock-fallback";

  function toggleNote(noteId: string) {
    setSelectedNoteIds((current) => {
      if (current.includes(noteId)) return current.filter((id) => id !== noteId);
      if (current.length >= 3) return current;
      return [...current, noteId];
    });
  }

  return (
    <section className="view-stack">
      <div className="view-header">
        <div>
          <p className="eyebrow">趋势复盘</p>
          <h2>关系回顾</h2>
        </div>
        <div className="temperature-ring">
          <span>{metrics.relationshipTemperature}</span>
          <small>关系温度</small>
        </div>
      </div>

      <div className="metrics-grid">
        <article className="metric-card">
          <span>同步率</span>
          <strong>{metrics.syncRate}%</strong>
        </article>
        <article className="metric-card">
          <span>平均心情</span>
          <strong>{metrics.averageMood ?? "暂无"}</strong>
        </article>
        <article className="metric-card">
          <span>平均能量</span>
          <strong>{metrics.averageEnergy ?? "暂无"}</strong>
        </article>
        <article className="metric-card">
          <span>平均想念</span>
          <strong>{metrics.averageLonging ?? "暂无"}</strong>
        </article>
        <article className="metric-card">
          <span>低心情天数</span>
          <strong>{metrics.lowMoodDays}</strong>
        </article>
        <article className="metric-card">
          <span>约定</span>
          <strong>
            完成 {metrics.completedPromises} / 延期 {metrics.postponedPromises}
          </strong>
        </article>
      </div>

      {metrics.insufficientData && (
        <div className="notice">
          <AlertTriangle size={17} />
          <span>数据还不够做趋势判断，当前先展示原始计数供复盘。</span>
        </div>
      )}

      <div className="two-column">
        <section className="panel">
          <div className="section-title">
            <h3>选择共享笔记</h3>
            <span className="muted-text">共享复盘最多使用 3 条</span>
          </div>
          {visibleNotes.map((note) => {
            const card = findCard(state, note.cardId);
            const checked = selectedNoteIds.includes(note.id);
            const disabled = !checked && selectedNoteIds.length >= 3;

            return (
              <label key={note.id} className={`note-option ${disabled ? "is-disabled" : ""}`}>
                <input checked={checked} disabled={disabled} type="checkbox" onChange={() => toggleNote(note.id)} />
                <span>
                  <strong>{card?.title ?? "同步笔记"}</strong>
                  <small>
                    {note.syncDate} · {note.note.slice(0, 120)}
                  </small>
                </span>
              </label>
            );
          })}
        </section>

        <section className="panel">
          <div className="section-title">
            <h3>本地模板 / 模拟分析</h3>
            <span className="muted-text">网页端 MVP 不接收真实大模型密钥</span>
          </div>
          <div className="insight-block">
            <FileText size={18} />
            <div>
              <strong>共享总结</strong>
              <p>
                这一阶段的同步覆盖率是 {metrics.syncRate}%。被选中的笔记都指向具体的小瞬间，适合温和讨论，而不是给关系下结论。
              </p>
            </div>
          </div>
          <div className="insight-block">
            <ShieldCheck size={18} />
            <div>
              <strong>安全回退状态</strong>
              <p>
                {unsafeFallback
                  ? "AI 输出不可用或不适合展示时，系统会使用更安全的本地复盘。"
                  : "当前启用本地模板模式。"}
              </p>
            </div>
          </div>
          <div className="insight-block">
            <Lock size={18} />
            <div>
              <strong>{actingUser.displayName} 可见的私密草稿</strong>
              <p>
                {privateDraftNote
                  ? `我把这件事先放在心里：「${privateDraftNote}」。我们可以找一个轻一点的时间聊聊吗？`
                  : "当前视角还没有可生成私密草稿的笔记。"}
              </p>
            </div>
          </div>
          <div className="selected-note-strip">
            {sharedNotes.length === 0 ? <span>还没有选择共享笔记。</span> : sharedNotes.map((note) => <span key={note}>{note}</span>)}
          </div>
        </section>
      </div>
    </section>
  );
}
