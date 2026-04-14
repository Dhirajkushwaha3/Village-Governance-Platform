import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";

export default function OfficersPage() {
  const { t } = useLanguage();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");

  async function loadOfficers(searchText) {
    setLoading(true);
    setMessage("");

    try {
      const url = searchText ? `/officers?q=${encodeURIComponent(searchText)}` : "/officers";
      const res = await api.get(url);
      setList(res.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load officers. Check backend server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOfficers();
  }, []);

  return (
    <section>
      <div className="section-header">
        <h2>{t.officersTitle}</h2>
        <div className="row">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} />
          <button className="btn ghost" onClick={() => loadOfficers(query)} type="button">
            {t.search}
          </button>
        </div>
      </div>

      <div className="grid card-grid">
        {list.map((officer) => (
          <article key={officer._id} className="card">
            <h3>{officer.name}</h3>
            <p>{officer.role}</p>
            <p>
              <strong>{t.area}:</strong> {officer.area}
            </p>
            <Link to={`/officers/${officer._id}`} className="btn solid">
              {t.details}
            </Link>
          </article>
        ))}
      </div>

      {!loading && list.length === 0 && !message && (
        <article className="panel">
          <p>No officers found yet. Run seed data or add officers from admin API.</p>
        </article>
      )}

      {loading && (
        <article className="panel">
          <p>Loading officers...</p>
        </article>
      )}

      {message && (
        <article className="panel">
          <p className="message">{message}</p>
        </article>
      )}
    </section>
  );
}
