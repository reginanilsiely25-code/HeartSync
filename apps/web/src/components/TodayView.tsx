import { Eye, EyeOff, Send } from "lucide-react";
import { useMemo, useState } from "react";
import type { DeviceUserId, SyncVisibility } from "../api/client";
import {
  findCard,
  getActingUser,
  getPartnerUser,
  todaysSyncFor,
  type DailySync,
  type DemoState,
  type SyncCard
} from "../state/demoSession";

type TodayViewProps = {
  actingDeviceUserId: DeviceUserId;
  state: DemoState;
  onActingDeviceUserIdChange: (deviceUserId: DeviceUserId) => void;
  onUpsertDailySync: (sync: Omit<DailySync, "id" | "updatedAt">) => void;
};

const syncDate = "2026-08-13";

function ScoreControl({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="score-control">
      <span>{label}</span>
      <input min={1} max={5} type="range" value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <strong>{value}</strong>
    </label>
  );
}

function CardButton({ card, selected, onSelect }: { card: SyncCard; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`sync-card-button ${selected ? "is-selected" : ""}`} type="button" onClick={onSelect}>
      <span className="sync-card-main">
        <span className="card-swatch" style={{ background: card.color }} />
        <span className="card-emoji">{card.emoji}</span>
        <span className="sync-card-copy">
          <strong>{card.title}</strong>
          <small>{card.tags.join(" / ")}</small>
        </span>
      </span>
      <span className="sync-card-meta">
        <span className="score-badges">
          <b>心情 {card.defaultMoodScore}</b>
          <b>能量 {card.defaultEnergyScore}</b>
          <b>想念 {card.defaultLongingScore}</b>
        </span>
      </span>
    </button>
  );
}

export default function TodayView({ actingDeviceUserId, state, onActingDeviceUserIdChange, onUpsertDailySync }: TodayViewProps) {
  const actingUser = getActingUser(state, actingDeviceUserId);
  const partnerUser = getPartnerUser(state, actingDeviceUserId);
  const existingSync = todaysSyncFor(state, actingDeviceUserId);
  const initialCard = existingSync ? findCard(state, existingSync.cardId) ?? state.syncCards[0] : state.syncCards[0];
  const [selectedCardId, setSelectedCardId] = useState(initialCard.id);
  const selectedCard = useMemo(() => findCard(state, selectedCardId) ?? state.syncCards[0], [selectedCardId, state]);
  const [moodScore, setMoodScore] = useState(existingSync?.moodScore ?? selectedCard.defaultMoodScore);
  const [energyScore, setEnergyScore] = useState(existingSync?.energyScore ?? selectedCard.defaultEnergyScore);
  const [longingScore, setLongingScore] = useState(existingSync?.longingScore ?? selectedCard.defaultLongingScore);
  const [visibility, setVisibility] = useState<SyncVisibility>(existingSync?.visibility ?? "partner_visible");
  const [note, setNote] = useState(existingSync?.note ?? "");

  function selectCard(card: SyncCard) {
    setSelectedCardId(card.id);
    setMoodScore(card.defaultMoodScore);
    setEnergyScore(card.defaultEnergyScore);
    setLongingScore(card.defaultLongingScore);
  }

  function submitSync() {
    onUpsertDailySync({
      userDeviceUserId: actingDeviceUserId,
      syncDate,
      cardId: selectedCard.id,
      moodScore,
      energyScore,
      longingScore,
      visibility,
      note
    });
  }

  return (
    <section className="view-stack">
      <div className="view-header">
        <div>
          <p className="eyebrow">今日同步</p>
          <h2>今天</h2>
        </div>
        <div className="segmented-control">
          {state.users.map((user) => (
            <button
              key={user.deviceUserId}
              className={actingDeviceUserId === user.deviceUserId ? "is-active" : ""}
              type="button"
              onClick={() => onActingDeviceUserIdChange(user.deviceUserId)}
            >
              {user.displayName}
            </button>
          ))}
        </div>
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="section-title">
            <h3>{actingUser.displayName} 的心情卡</h3>
            <span className="muted-text">分数范围为 1-5</span>
          </div>

          <div className="sync-card-grid">
            {state.syncCards.map((card) => (
              <CardButton key={card.id} card={card} selected={card.id === selectedCard.id} onSelect={() => selectCard(card)} />
            ))}
          </div>

          <div className="score-grid">
            <ScoreControl label="心情" value={moodScore} onChange={setMoodScore} />
            <ScoreControl label="能量" value={energyScore} onChange={setEnergyScore} />
            <ScoreControl label="想念" value={longingScore} onChange={setLongingScore} />
          </div>

          <div className="field-row">
            <label>
              今天想说
              <textarea value={note} maxLength={160} onChange={(event) => setNote(event.target.value)} />
            </label>
          </div>

          <div className="form-footer">
            <div className="segmented-control visibility-control">
              <button
                className={visibility === "partner_visible" ? "is-active" : ""}
                type="button"
                onClick={() => setVisibility("partner_visible")}
              >
                <Eye size={16} />
                伴侣可见
              </button>
              <button className={visibility === "private" ? "is-active" : ""} type="button" onClick={() => setVisibility("private")}>
                <EyeOff size={16} />
                仅自己可见
              </button>
            </div>
            <button className="primary-button" type="button" onClick={submitSync}>
              <Send size={17} />
              提交今日状态
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="section-title">
            <h3>今天的两人状态</h3>
            <span className="muted-text">{syncDate}</span>
          </div>
          {[actingUser, partnerUser].map((user) => {
            const sync = todaysSyncFor(state, user.deviceUserId);
            const card = sync ? findCard(state, sync.cardId) : undefined;
            const hiddenForViewer = sync?.visibility === "private" && user.deviceUserId !== actingDeviceUserId;

            return (
              <article key={user.deviceUserId} className={`today-row ${hiddenForViewer ? "is-private" : ""}`}>
                <span className="avatar-dot" style={{ background: user.avatarColor }} />
                <div className="today-row-body">
                  <div className="row-heading">
                    <strong>{user.displayName}</strong>
                    <span>{sync ? "已同步" : "等待中"}</span>
                  </div>
                  {sync && hiddenForViewer && (
                    <p className="private-banner">对方已同步，但卡片、分数和笔记设置为仅自己可见。</p>
                  )}
                  {sync && !hiddenForViewer && card && (
                    <>
                      <p>
                        {card.emoji} {card.title}
                      </p>
                      <div className="inline-metrics">
                        <span>心情 {sync.moodScore}</span>
                        <span>能量 {sync.energyScore}</span>
                        <span>想念 {sync.longingScore}</span>
                      </div>
                      {sync.note && <p className="note-text">{sync.note}</p>}
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </section>
  );
}
