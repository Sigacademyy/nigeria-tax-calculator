import { useState } from "react";
import "../styles/ui.css";

export default function DashboardLayout({
  user,
  menuItems,
  renderContent,
  onEditUser,
}) {
  const [active, setActive] = useState(menuItems[0].key);

  return (
    <div className="dashboard">
      {/* LEFT PANEL */}
      <aside className="sidebar">
        <div className="user-card" style={{ position: "relative" }}>
          <strong>{user.name || "Not Set"}</strong>
          <div className="muted">{user.idLabel}: {user.idValue || "Not Set"}</div>
          {onEditUser && (
            <button
              onClick={onEditUser}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: "16px",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.3s ease",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--primary)";
                e.currentTarget.style.backgroundColor = "var(--bg-soft)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)";
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              title="Edit profile information"
            >
              ✏️
            </button>
          )}
        </div>

        <nav className="menu">
          {menuItems.map((item) => (
            <button
              key={item.key}
              className={active === item.key ? "menu-item active" : "menu-item"}
              onClick={() => setActive(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* RIGHT PANEL */}
      <main className="workspace">
        {renderContent(active)}
      </main>
    </div>
  );
}
