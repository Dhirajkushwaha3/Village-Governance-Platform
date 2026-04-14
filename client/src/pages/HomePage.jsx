import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";

export default function HomePage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("vgp_token");
    if (!token) return;

    api.get("/dashboard/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  return (
    <section>
      <div className="hero">
        <h1>{t.heroTitle}</h1>
        <p>{t.heroText}</p>
        <div className="hero-actions">
          <Link to="/complaints" className="btn solid">
            {t.navComplaints}
          </Link>
          <Link to="/submit" className="btn ghost">
            {t.submitComplaint}
          </Link>
        </div>
      </div>

      <div className="grid stats-grid">
        <StatCard label={t.statComplaints} value={stats?.totalComplaints ?? "--"} />
        <StatCard label={t.statResolved} value={stats?.resolvedComplaints ?? "--"} />
        <StatCard label={t.statPending} value={stats?.pendingComplaints ?? "--"} />
        <StatCard label={t.statCandidates} value={stats?.activeCandidates ?? "--"} />
      </div>

      <article className="info-card">
        <h3>{t.quickStart}</h3>
        <p>{t.quickStartText}</p>
      </article>
    </section>
  );
}
