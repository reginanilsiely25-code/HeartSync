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
  const serviceStatusLabels: Record<string, string> = {
    "local-demo": "本地演示",
    "backend-ready": "后端已连接"
  };

  return (
    <section className="view-stack">
      <div className="view-header">
        <div>
          <p className="eyebrow">情侣设置</p>
          <h2>我们的空间</h2>
        </div>
        <button className="primary-button" type="button" onClick={onResetDemo}>
          <RotateCcw size={17} />
          重置演示
        </button>
      </div>

      <div className="two-column">
        <section className="panel">
          <div className="section-title">
            <h3>切换操作视角</h3>
            <span className="muted-text">评审者可以操作任意一方</span>
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
                    <small>{user.role === "me" ? "我方" : "伴侣方"}</small>
                    </span>
                  </button>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <div className="section-title">
            <h3>配对与服务</h3>
            <span className="muted-text">受控演示情侣空间</span>
          </div>
          <div className="settings-list">
            <div>
              <Shield size={18} />
              <span>配对码</span>
              <strong>{state.pairingCode}</strong>
            </div>
            <div>
              <Server size={18} />
              <span>服务状态</span>
              <strong>{serviceStatusLabels[state.serviceStatus] ?? state.serviceStatus}</strong>
            </div>
            <div>
              <Sparkles size={18} />
              <span>LLM 状态</span>
              <strong>本地模板 / 模拟输出</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="impact-band">
        <div>
          <p className="eyebrow">评审就绪度</p>
          <h3>
            {actingUser.displayName} 正在查看 {metrics.relationshipTemperature} 度的关系复盘
          </h3>
        </div>
        <p>
          Web 不保存真实 LLM 密钥。重置会恢复本地演示卡片、私密可见性示例、路线约定和复盘笔记。
        </p>
      </section>
    </section>
  );
}
