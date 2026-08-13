import { RotateCcw, Server, Shield, Sparkles } from "lucide-react";
import type { DeviceUserId } from "../api/client";
import { actingDeviceUserIds, getActingUser, type DemoState, type Metrics } from "../state/demoSession";

type UsViewProps = {
  actingDeviceUserId: DeviceUserId;
  metrics: Metrics;
  state: DemoState;
  onActingDeviceUserIdChange: (deviceUserId: DeviceUserId) => void;
  onResetDemo: () => void;
};

export default function UsView({ actingDeviceUserId, metrics, state, onActingDeviceUserIdChange, onResetDemo }: UsViewProps) {
  const actingUser = getActingUser(state, actingDeviceUserId);

  return (
    <section className="view-stack">
      <div className="view-header">
        <div>
          <p className="eyebrow">Couple settings</p>
          <h2>Us</h2>
        </div>
        <button className="primary-button" type="button" onClick={onResetDemo}>
          <RotateCcw size={17} />
          Reset demo
        </button>
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="section-title">
            <h3>Acting user switch</h3>
            <span className="muted-text">Reviewer can operate either side</span>
          </div>
          <div className="user-switch-list">
            {actingDeviceUserIds.map((deviceUserId) => {
              const user = getActingUser(state, deviceUserId);
              return (
                <button
                  key={deviceUserId}
                  className={`user-switch ${actingDeviceUserId === deviceUserId ? "is-active" : ""}`}
                  type="button"
                  onClick={() => onActingDeviceUserIdChange(deviceUserId)}
                >
                  <span className="avatar-dot" style={{ background: user.avatarColor }} />
                  <span>
                    <strong>{user.displayName}</strong>
                    <small>{deviceUserId}</small>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="section-title">
            <h3>Pairing and services</h3>
            <span className="muted-text">Bounded demo couple</span>
          </div>
          <div className="settings-list">
            <div>
              <Shield size={18} />
              <span>Pairing code</span>
              <strong>{state.pairingCode}</strong>
            </div>
            <div>
              <Server size={18} />
              <span>Service health</span>
              <strong>{state.serviceStatus}</strong>
            </div>
            <div>
              <Sparkles size={18} />
              <span>LLM status</span>
              <strong>local template / mock only</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="impact-band">
        <div>
          <p className="eyebrow">Review readiness</p>
          <h3>
            {actingUser.displayName} is viewing a {metrics.relationshipTemperature}-degree reflection
          </h3>
        </div>
        <p>
          Web stores no real LLM keys. Reset restores the local demo cards, private visibility example, route promise, and review notes.
        </p>
      </section>
    </section>
  );
}
