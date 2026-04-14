import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  if (!stats) {
    return <p>Loading...</p>;
  }

  return (
    <section>
      <h2>{t.dashboardTitle}</h2>
      <div className="grid stats-grid">
        <StatCard label={t.statComplaints} value={stats.totalComplaints} />
        <StatCard label={t.statResolved} value={stats.resolvedComplaints} />
        <StatCard label={t.statPending} value={stats.pendingComplaints} />
        <StatCard label={t.statCandidates} value={stats.activeCandidates} />
      </div>

      <article className="panel">
        <h3>Resolved Ratio</h3>
        <div className="meter">
          <div className="meter-fill" style={{ width: `${stats.resolvedRatio}%` }} />
        </div>
        <p>{stats.resolvedRatio}% complaints resolved</p>
      </article>

      <article className="panel">
        <h3>Issue Categories</h3>
        <div className="stack">
          {stats.categories.map((item) => (
            <div className="row between" key={item._id}>
              <span>{item._id}</span>
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
