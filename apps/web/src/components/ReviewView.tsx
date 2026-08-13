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
          <p className="eyebrow">Trend reflection</p>
          <h2>Review</h2>
        </div>
        <div className="temperature-ring">
          <span>{metrics.relationshipTemperature}</span>
          <small>temperature</small>
        </div>
      </div>

      <div className="metrics-grid">
        <article className="metric-card">
          <span>Sync rate</span>
          <strong>{metrics.syncRate}%</strong>
        </article>
        <article className="metric-card">
          <span>Avg mood</span>
          <strong>{metrics.averageMood ?? "n/a"}</strong>
        </article>
        <article className="metric-card">
          <span>Avg energy</span>
          <strong>{metrics.averageEnergy ?? "n/a"}</strong>
        </article>
        <article className="metric-card">
          <span>Avg longing</span>
          <strong>{metrics.averageLonging ?? "n/a"}</strong>
        </article>
        <article className="metric-card">
          <span>Low mood days</span>
          <strong>{metrics.lowMoodDays}</strong>
        </article>
        <article className="metric-card">
          <span>Promises</span>
          <strong>
            {metrics.completedPromises} done / {metrics.postponedPromises} moved
          </strong>
        </article>
      </div>

      {metrics.insufficientData && (
        <div className="notice">
          <AlertTriangle size={17} />
          <span>Insufficient data for trend claims. Raw counts are still shown for review.</span>
        </div>
      )}

      <div className="two-column">
        <section className="panel">
          <div className="section-title">
            <h3>Note selection</h3>
            <span className="muted-text">Shared review input capped at 3 notes</span>
          </div>
          {visibleNotes.map((note) => {
            const card = findCard(state, note.cardId);
            const checked = selectedNoteIds.includes(note.id);
            const disabled = !checked && selectedNoteIds.length >= 3;

            return (
              <label key={note.id} className={`note-option ${disabled ? "is-disabled" : ""}`}>
                <input checked={checked} disabled={disabled} type="checkbox" onChange={() => toggleNote(note.id)} />
                <span>
                  <strong>{card?.title ?? "Sync note"}</strong>
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
            <h3>Local template / mock sections</h3>
            <span className="muted-text">No real LLM key is accepted by Web MVP</span>
          </div>
          <div className="insight-block">
            <FileText size={18} />
            <div>
              <strong>Shared summary</strong>
              <p>
                This period shows a steady ritual with {metrics.syncRate}% sync coverage. The selected notes point to small moments
                that are concrete enough to discuss without turning them into a verdict.
              </p>
            </div>
          </div>
          <div className="insight-block">
            <ShieldCheck size={18} />
            <div>
              <strong>Unsafe fallback status</strong>
              <p>
                {unsafeFallback
                  ? "We used a safer local reflection because AI output was unavailable or unsuitable."
                  : "Local template mode is active."}
              </p>
            </div>
          </div>
          <div className="insight-block">
            <Lock size={18} />
            <div>
              <strong>Private draft visible to {actingUser.displayName}</strong>
              <p>
                {privateDraftNote
                  ? `I have been holding this privately: "${privateDraftNote}". Could we make a gentle pocket of time for it?`
                  : "No private draft source is available for the acting user yet."}
              </p>
            </div>
          </div>
          <div className="selected-note-strip">
            {sharedNotes.length === 0 ? <span>No shared notes selected.</span> : sharedNotes.map((note) => <span key={note}>{note}</span>)}
          </div>
        </section>
      </div>
    </section>
  );
}
