import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-navbar)",
        boxShadow: `0 1px 3px var(--shadow)`,
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "16px",
          paddingBottom: "16px",
          flexWrap: "wrap",          // ✅ allow wrapping
          gap: "12px",               // ✅ spacing when wrapped
        }}
      >
        {/* Logo / App Name */}
        <NavLink
          to="/"
          style={{
            fontWeight: 700,
            fontSize: "20px",
            textDecoration: "none",
            color: "var(--text-main)",
            whiteSpace: "nowrap",
            transition: "color 0.3s ease",
          }}
        >
          Nigeria Tax Calculator
        </NavLink>

        {isAuthenticated && (
          <div style={{ fontSize: "14px", color: "var(--text-muted)", marginRight: "auto", marginLeft: "16px" }}>
            {user?.username}
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: "6px",
            padding: "8px 12px",
            cursor: "pointer",
            fontSize: "20px",
            color: "var(--text-main)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-soft)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {/* Navigation Links - Desktop */}
        {isAuthenticated && (
          <div
            className="nav-links-desktop"
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
            }}
          >
            <NavLink to="/" style={navStyle}>
              Home
            </NavLink>

            <NavLink to="/individual" style={navStyle}>
              Individual (PIT)
            </NavLink>

            <NavLink to="/business" style={navStyle}>
              Business / LLC
            </NavLink>

            <NavLink to="/expense-tracking" style={navStyle}>
              Expense Tracking
            </NavLink>

            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "none",
                color: "#ef4444",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "14px",
                padding: "4px 8px",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.8";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile Menu Button */}
        {isAuthenticated && (
          <button
            className="mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              fontSize: "24px",
              color: "var(--text-main)",
              transition: "color 0.3s ease",
            }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? "✕" : "☰"}
          </button>
        )}
      </div>

      {/* Mobile Navigation Links */}
      {isMobileMenuOpen && isAuthenticated && (
        <div
          className="nav-links-mobile"
          style={{
            display: "none",
            flexDirection: "column",
            padding: "16px 24px",
            borderTop: "1px solid var(--border)",
            gap: "12px",
            backgroundColor: "var(--bg-navbar)",
            transition: "background-color 0.3s ease, border-color 0.3s ease",
          }}
        >
          <NavLink to="/" style={navStyle} onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </NavLink>

          <NavLink to="/individual" style={navStyle} onClick={() => setIsMobileMenuOpen(false)}>
            Individual (PIT)
          </NavLink>

          <NavLink to="/business" style={navStyle} onClick={() => setIsMobileMenuOpen(false)}>
            Business / LLC
          </NavLink>

          <NavLink to="/expense-tracking" style={navStyle} onClick={() => setIsMobileMenuOpen(false)}>
            Expense Tracking
          </NavLink>

          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#ef4444",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
              textAlign: "left",
              padding: "8px 0",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

const navStyle = ({ isActive }) => ({
  textDecoration: "none",
  fontWeight: 600,
  color: isActive ? "var(--primary)" : "var(--text-main)",
  transition: "color 0.3s ease",
});
