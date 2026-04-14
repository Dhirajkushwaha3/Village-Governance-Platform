import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";

const emptyForm = {
  name: "",
  designation: "member",
  age: "",
  mobileOne: "",
  mobileTwo: "",
  photo: "",
  tagline: "",
  education: "",
  experience: "",
  promises: "",
  contactInfo: "",
  area: ""
};

const placeholderImage = "https://placehold.co/600x300/e7f4ee/2f5d46?text=Candidate";

function getUser() {
  return JSON.parse(localStorage.getItem("vgp_user") || "null");
}

function buildCandidatePayload(form) {
  return {
    name: form.name.trim(),
    designation: form.designation,
    age: Number(form.age) || undefined,
    mobileNumbers: [form.mobileOne, form.mobileTwo].map((item) => item.trim()).filter(Boolean),
    photo: form.photo.trim(),
    tagline: form.tagline.trim(),
    education: form.education.trim(),
    experience: form.experience.trim(),
    promises: form.promises.split(",").map((item) => item.trim()).filter(Boolean),
    contactInfo: form.contactInfo.trim(),
    area: form.area.trim()
  };
}

function updateForm(setForm, key, value) {
  setForm((current) => ({ ...current, [key]: value }));
}

function CandidateCard({ item, selected, onToggle, onVerify, onDelete, user, t }) {
  return (
    <article className="card">
      <img
        src={item.photo || placeholderImage}
        alt={item.name}
        className="thumb candidate-thumb"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.src = placeholderImage;
        }}
      />
      <h3>{item.name}</h3>
      <p>{item.designation === "gram_pradhan" ? "Gram Pradhan" : "Member"}</p>
      <p>{item.tagline}</p>
      <span className={`badge ${item.verificationStatus === "approved" ? "ok" : "wait"}`}>
        {item.verificationStatus === "approved" ? t.verified : t.pending}
      </span>
      <div className="row">
        <Link className="btn ghost" to={`/candidates/${item._id}`}>
          {t.details}
        </Link>
        <button className="btn ghost" type="button" onClick={() => onToggle(item._id)}>
          {selected ? t.remove : t.compare}
        </button>
      </div>
      {user?.role === "admin" && item.verificationStatus === "pending" && (
        <div className="row">
          <button className="btn solid" type="button" onClick={() => onVerify(item._id, "approved")}>Approve</button>
          <button className="btn ghost" type="button" onClick={() => onVerify(item._id, "rejected")}>Reject</button>
        </div>
      )}
      {user?.role === "admin" && (
        <div className="row">
          <button className="btn ghost" type="button" onClick={() => onDelete(item._id)}>Delete</button>
        </div>
      )}
    </article>
  );
}

export default function CandidatesPage() {
  const { t } = useLanguage();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [registerForm, setRegisterForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const user = getUser();

  async function loadCandidates() {
    setLoading(true);
    setMessage("");

    try {
      const url = user?.role === "admin" ? "/candidates?includePending=true" : "/candidates";
      const res = await api.get(url);
      setCandidates(res.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load candidates. Check backend server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCandidates();
  }, []);

  function toggleCandidate(id) {
    setSelected((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      return [...current, id].slice(0, 4);
    });
  }

  async function compareSelected() {
    if (selected.length < 2) return;
    const res = await api.post("/candidates/compare", { ids: selected });
    setComparison(res.data);
  }

  async function registerCandidate(e) {
    e.preventDefault();
    try {
      const payload = buildCandidatePayload(registerForm);

      if (user?.role === "admin") {
        await api.post("/candidates/admin-create", {
          ...payload,
          verificationStatus: "approved"
        });
        setMessage("Candidate added by admin");
      } else {
        await api.post("/candidates/register", payload);
        setMessage("Candidate profile submitted for admin approval");
      }

      setRegisterForm({
        ...emptyForm
      });
      await loadCandidates();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not submit profile");
    }
  }

  async function verifyCandidate(id, status) {
    try {
      await api.patch(`/candidates/${id}/verify`, { status });
      await loadCandidates();
      setMessage(`Candidate ${status}`);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update candidate status");
    }
  }

  async function deleteCandidate(id) {
    const shouldDelete = window.confirm("Delete this candidate?");
    if (!shouldDelete) return;

    try {
      await api.delete(`/candidates/${id}`);
      setMessage("Candidate deleted");
      await loadCandidates();
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not delete candidate");
    }
  }

  const gramPradhanList = candidates.filter((item) => item.designation === "gram_pradhan");
  const membersList = candidates.filter((item) => item.designation !== "gram_pradhan");

  return (
    <section>
      <div className="section-header">
        <h2>{t.candidatesTitle}</h2>
        <button className="btn ghost" onClick={compareSelected} disabled={selected.length < 2} type="button">
          {t.compareNow}
        </button>
      </div>

      <h3>Gram Pradhan</h3>
      <div className="grid card-grid">
        {gramPradhanList.map((item) => (
          <CandidateCard
            key={item._id}
            item={item}
            selected={selected.includes(item._id)}
            onToggle={toggleCandidate}
            onVerify={verifyCandidate}
            onDelete={deleteCandidate}
            user={user}
            t={t}
          />
        ))}
      </div>

      <h3>Members</h3>
      <div className="grid card-grid">
        {membersList.map((item) => (
          <CandidateCard
            key={item._id}
            item={item}
            selected={selected.includes(item._id)}
            onToggle={toggleCandidate}
            onVerify={verifyCandidate}
            onDelete={deleteCandidate}
            user={user}
            t={t}
          />
        ))}
      </div>

      {!loading && candidates.length === 0 && !message && (
        <article className="panel">
          <p>No candidates found yet. Run seed data or add verified candidates.</p>
        </article>
      )}

      {loading && (
        <article className="panel">
          <p>Loading candidates...</p>
        </article>
      )}

      {message && (
        <article className="panel">
          <p className="message">{message}</p>
        </article>
      )}

      {comparison.length > 1 && (
        <div className="panel">
          <h3>{t.compareNow}</h3>
          <div className="comparison-grid">
            {comparison.map((item) => (
              <article className="card" key={item._id}>
                <h4>{item.name}</h4>
                <p>
                  <strong>{t.education}:</strong> {item.education || "-"}
                </p>
                <p>
                  <strong>{t.experience}:</strong> {item.experience || "-"}
                </p>
                <p>
                  <strong>{t.promises}:</strong> {(item.promises || []).join(", ") || "-"}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}

      {(user?.role === "candidate" || user?.role === "admin") && (
        <form className="panel stack" onSubmit={registerCandidate}>
          <h3>{user?.role === "admin" ? "Add Candidate (Admin)" : t.registerCandidate}</h3>
          <input placeholder={t.name} value={registerForm.name} onChange={(e) => updateForm(setRegisterForm, "name", e.target.value)} required />
          <select value={registerForm.designation} onChange={(e) => updateForm(setRegisterForm, "designation", e.target.value)}>
            <option value="gram_pradhan">Gram Pradhan</option>
            <option value="member">Member</option>
          </select>
          <input
            placeholder="Age"
            type="number"
            min="21"
            value={registerForm.age}
            onChange={(e) => updateForm(setRegisterForm, "age", e.target.value)}
          />
          <input
            placeholder="Mobile Number 1"
            value={registerForm.mobileOne}
            onChange={(e) => updateForm(setRegisterForm, "mobileOne", e.target.value)}
          />
          <input
            placeholder="Mobile Number 2 (Optional)"
            value={registerForm.mobileTwo}
            onChange={(e) => updateForm(setRegisterForm, "mobileTwo", e.target.value)}
          />
          <input placeholder="Photo URL" value={registerForm.photo} onChange={(e) => updateForm(setRegisterForm, "photo", e.target.value)} />
          <input placeholder="Tagline" value={registerForm.tagline} onChange={(e) => updateForm(setRegisterForm, "tagline", e.target.value)} required />
          <input placeholder={t.education} value={registerForm.education} onChange={(e) => updateForm(setRegisterForm, "education", e.target.value)} />
          <input placeholder={t.experience} value={registerForm.experience} onChange={(e) => updateForm(setRegisterForm, "experience", e.target.value)} />
          <input placeholder="Promises (comma separated)" value={registerForm.promises} onChange={(e) => updateForm(setRegisterForm, "promises", e.target.value)} />
          <input placeholder={t.contactInfo} value={registerForm.contactInfo} onChange={(e) => updateForm(setRegisterForm, "contactInfo", e.target.value)} />
          <input placeholder={t.area} value={registerForm.area} onChange={(e) => updateForm(setRegisterForm, "area", e.target.value)} />
          <button className="btn solid" type="submit">
            {t.submit}
          </button>
          {message && <p className="message">{message}</p>}
        </form>
      )}
    </section>
  );
}
