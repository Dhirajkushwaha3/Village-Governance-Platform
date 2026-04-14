import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";

export default function OfficerDetailsPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [officer, setOfficer] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api
      .get(`/officers/${id}`)
      .then((res) => setOfficer(res.data))
      .catch((error) => setMessage(error.response?.data?.message || "Could not load officer details"));
  }, [id]);

  if (message) {
    return (
      <section className="panel">
        <p className="message">{message}</p>
      </section>
    );
  }

  if (!officer) {
    return (
      <section className="panel">
        <p>Loading details...</p>
      </section>
    );
  }

  return (
    <section className="panel stack">
      <h2>{officer.name}</h2>
      <p>
        <strong>{t.role}:</strong> {officer.role}
      </p>
      <p>
        <strong>{t.area}:</strong> {officer.area}
      </p>
      <p>
        <strong>Office:</strong> {officer.officeName || "Not available"}
      </p>
      <p>
        <strong>Office Address:</strong> {officer.officeAddress || "Not available"}
      </p>
      <p>
        <strong>Phone:</strong> {officer.phone || officer.contactDetails || "Not available"}
      </p>
      <p>
        <strong>Email:</strong> {officer.email || "Not available"}
      </p>
    </section>
  );
}
