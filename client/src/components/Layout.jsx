import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const navItems = [
  { path: "/", label: "navHome" },
  { path: "/candidates", label: "navCandidates" },
  { path: "/complaints", label: "navComplaints" },
  { path: "/submit", label: "navSubmit" },
  { path: "/officers", label: "navOfficers" },
  { path: "/dashboard", label: "navDashboard" }
];

function getUser() {
  return JSON.parse(localStorage.getItem("vgp_user") || "null");
}

export default function Layout({ children }) {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [user, setUser] = useState(() => getUser());

  useEffect(() => {
    setUser(getUser());
  }, [location.pathname]);

  useEffect(() => {
    function onStorage(event) {
      if (event.key === "vgp_user" || event.key === "vgp_token") {
        setUser(getUser());
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleLogout() {
    localStorage.removeItem("vgp_token");
    localStorage.removeItem("vgp_user");
    setUser(null);
    window.location.href = "/";
  }

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          {t.appName}
        </Link>

        <div className="topbar-actions">
          <button
            className="lang-btn"
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            type="button"
          >
            {language === "en" ? "हिंदी" : "English"}
          </button>
          {user ? (
            <>
              <Link className="login-link" to="/login">
                {user.name}
              </Link>
              <button className="lang-btn" type="button" onClick={handleLogout}>
                {t.logout}
              </button>
            </>
          ) : (
            <Link className="login-link" to="/login">
              {t.navLogin}
            </Link>
          )}
        </div>
      </header>

      <nav className="nav-strip">
        {navItems.map((item) => (
          <NavLink key={item.path} to={item.path} className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}>
            {t[item.label]}
          </NavLink>
        ))}
      </nav>

      <main className="page">{children}</main>
    </div>
  );
}
