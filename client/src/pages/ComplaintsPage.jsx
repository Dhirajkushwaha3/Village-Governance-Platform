import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";

function getUser() {
  return JSON.parse(localStorage.getItem("vgp_user") || "null");
}

function buildImageUrl(baseUrl, imagePath) {
  if (!imagePath) return "";
  return `${baseUrl}${imagePath}`;
}

function canEscalate(complaint) {
  const createdAt = new Date(complaint.createdAt).getTime();
  const twoDaysLater = createdAt + 48 * 60 * 60 * 1000;
  return Date.now() >= twoDaysLater && !["resolved", "rejected", "escalated"].includes(complaint.status);
}

function getStatusLabel(status) {
  if (status === "in_progress") return "In Progress";
  if (status === "resolved") return "Approved";
  if (status === "pending") return "Pending";
  if (status === "rejected") return "Rejected";
  return status;
}

export default function ComplaintsPage() {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [message, setMessage] = useState("");
  const [responseText, setResponseText] = useState({});
  const [previewImage, setPreviewImage] = useState("");

  const user = getUser();
  const imageBaseUrl = useMemo(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    return apiUrl.replace(/\/api$/, "");
  }, []);

  async function load() {
    const [complaintsRes, officersRes] = await Promise.all([api.get("/complaints"), api.get("/officers")]);
    setComplaints(complaintsRes.data);
    setOfficers(officersRes.data);
  }

  useEffect(() => {
    load().catch(() => setMessage("Could not load complaints"));
  }, []);

  async function upvote(id) {
    try {
      await api.post(`/complaints/${id}/upvote`);
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || t.onlyLoggedIn);
    }
  }

  async function escalate(id, officerId) {
    if (!officerId) return;
    try {
      await api.post(`/complaints/${id}/escalate`, { officerId });
      await load();
      setMessage("Complaint escalated");
    } catch (error) {
      setMessage(error.response?.data?.message || "Escalation failed");
    }
  }

  async function postResponse(id) {
    const text = (responseText[id] || "").trim();
    if (!text) return;
    try {
      await api.post(`/complaints/${id}/respond`, { message: text });
      setResponseText((current) => ({ ...current, [id]: "" }));
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || t.onlyLoggedIn);
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(`/complaints/${id}/status`, { status });
      await load();
      setMessage("Complaint status updated");
    } catch (error) {
      setMessage(error.response?.data?.message || "Only admin can update status");
    }
  }

  return (
    <section>
      <h2>{t.complaintsTitle}</h2>
      {message && <p className="message">{message}</p>}
      <div className="stack">
        {complaints.map((item) => (
          <article className="card" key={item._id}>
            <div className="row between">
              <h3>{item.title}</h3>
              <span className={`badge status-pill status-${item.status}`}>{getStatusLabel(item.status)}</span>
            </div>
            <p>{item.description}</p>
            <p>
              <strong>Raised By:</strong> {item.createdBy?.name || "Unknown User"}
            </p>
            <p>
              <strong>{t.category}:</strong> {item.category} | <strong>{t.location}:</strong> {item.location}
            </p>
            <p>
              <strong>{t.upvote}:</strong> {item.upvoteCount}
            </p>

            {item.imageUrl && (
              <img
                className="thumb"
                  src={buildImageUrl(imageBaseUrl, item.imageUrl)}
                alt={item.title}
                  onClick={() => setPreviewImage(buildImageUrl(imageBaseUrl, item.imageUrl))}
              />
            )}

            <div className="row">
              <button className="btn ghost" type="button" onClick={() => upvote(item._id)}>
                {t.upvote}
              </button>
            </div>

            {Array.isArray(item.responses) && item.responses.length > 0 && (
              <div className="responses">
                {item.responses.map((resp) => (
                  <p key={resp._id}>
                    <strong>{resp.role}:</strong> {resp.message}
                  </p>
                ))}
              </div>
            )}

            {(user?.role === "candidate" || user?.role === "admin") && (
              <div className="row">
                <input
                  value={responseText[item._id] || ""}
                  onChange={(e) => setResponseText((current) => ({ ...current, [item._id]: e.target.value }))}
                  placeholder="Write response"
                />
                <button className="btn ghost" onClick={() => postResponse(item._id)} type="button">
                  {t.respond}
                </button>
              </div>
            )}

            {user?.role === "admin" && (
              <div className="row status-actions">
                <button className="btn status-btn status-pending" type="button" onClick={() => updateStatus(item._id, "pending")}>
                  Pending
                </button>
                <button className="btn status-btn status-progress" type="button" onClick={() => updateStatus(item._id, "in_progress")}>
                  In Progress
                </button>
                <button className="btn status-btn status-approved" type="button" onClick={() => updateStatus(item._id, "resolved")}>
                  Approved
                </button>
              </div>
            )}

            {canEscalate(item) && (
              <div className="row">
                <select onChange={(e) => escalate(item._id, e.target.value)} defaultValue="">
                  <option value="">{t.escalate}</option>
                  {officers.map((officer) => (
                    <option key={officer._id} value={officer._id}>
                      {officer.name} - {officer.role}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {item.escalatedTo && (
              <p>
                Escalated to: {item.escalatedTo.name} ({item.escalatedTo.role}) - {item.escalatedTo.phone || item.escalatedTo.contactDetails}
              </p>
            )}
          </article>
        ))}
      </div>

      {previewImage && (
        <div className="image-modal" role="button" tabIndex={0} onClick={() => setPreviewImage("")} onKeyDown={() => setPreviewImage("")}>
          <img src={previewImage} alt="Complaint" className="image-modal-content" />
        </div>
      )}
    </section>
  );
}
