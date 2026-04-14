import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";

export default function CandidateDetailsPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    api.get(`/candidates/${id}`).then((res) => setCandidate(res.data)).catch(() => {});
  }, [id]);

  if (!candidate) return <p>Loading...</p>;

  const roleLabel = candidate.designation === "gram_pradhan" ? "Gram Pradhan" : "Member";
  const mobileNumbers = Array.isArray(candidate.mobileNumbers) ? candidate.mobileNumbers.filter(Boolean) : [];

  return (
    <article className="panel">
      <img
        src={candidate.photo || "https://placehold.co/800x380/e7f4ee/2f5d46?text=Candidate"}
        alt={candidate.name}
        className="hero-image"
        onError={(e) => {
          e.currentTarget.src = "https://placehold.co/800x380/e7f4ee/2f5d46?text=Candidate";
        }}
      />
      <h2>{roleLabel}: {candidate.name}</h2>
      <p>{candidate.tagline}</p>
      <p>
        <strong>{t.education}:</strong> {candidate.education || "-"}
      </p>
      <p>
        <strong>Age:</strong> {candidate.age || "-"}
      </p>
      <p>
        <strong>Mobile Numbers:</strong> {mobileNumbers.length ? mobileNumbers.join(", ") : candidate.contactInfo || "-"}
      </p>
      <p>
        <strong>{t.experience}:</strong> {candidate.experience || "-"}
      </p>
      <p>
        <strong>{t.promises}:</strong> {(candidate.promises || []).join(", ") || "-"}
      </p>
      <p>
        <strong>{t.contactInfo}:</strong> {candidate.contactInfo || "-"}
      </p>
      <p>
        <strong>{t.status}:</strong> {candidate.verificationStatus}
      </p>
    </article>
  );
}
