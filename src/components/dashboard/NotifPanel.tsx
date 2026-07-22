import { useApp } from "@/context/AppContext";
import { timeAgo } from "@/lib/format";
import type { NotifTarget } from "@/lib/types";

export default function NotifPanel({
  target, open, onClose,
}: { target: NotifTarget; open: boolean; onClose: () => void }) {
  const { notifications, markRead, markAllRead } = useApp();
  if (!open) return null;
  const list = notifications[target];

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 49 }} onClick={onClose} />
      <div className="notif-panel">
        <div className="notif-head">
          <h4><i className="fas fa-bell" /> Notifikasi</h4>
          <button onClick={() => markAllRead(target)} style={{ color: "#fff", fontSize: ".8rem" }}>
            Tandai semua
          </button>
        </div>
        <div className="notif-list">
          {list.length === 0 ? (
            <div className="notif-empty"><i  className="fas fa-bell-slash" /> Tidak ada notifikasi</div>
          ) : list.map((n) => (
            <div key={n.id} className={`notif-item ${n.read ? "" : "unread"}`}
              onClick={() => markRead(target, n.id)}>
              <div className="ic"><i className="fas fa-bell" /></div>
              <div style={{ flex: 1 }}>
                <h5>{n.title}</h5>
                <p>{n.desc}</p>
                <small>{timeAgo(n.time)}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
