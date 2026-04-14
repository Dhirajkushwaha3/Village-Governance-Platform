import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import api from "../services/api";

const categories = ["road", "water", "electricity", "sanitation", "health", "education", "other"];

function updateForm(setForm, key, value) {
  setForm((current) => ({ ...current, [key]: value }));
}

export default function SubmitComplaintPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "road",
    location: "",
    image: null
  });
  const [message, setMessage] = useState("");

  async function onSubmit(e) {
    e.preventDefault();

    try {
      const body = new FormData();
      body.append("title", form.title);
      body.append("description", form.description);
      body.append("category", form.category);
      body.append("location", form.location);
      if (form.image) body.append("image", form.image);

      await api.post("/complaints", body, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setForm({ title: "", description: "", category: "road", location: "", image: null });
      setMessage("Complaint submitted successfully");
    } catch (error) {
      setMessage(error.response?.data?.message || t.onlyLoggedIn);
    }
  }

  return (
    <section className="panel">
      <h2>{t.submitComplaint}</h2>
      <form onSubmit={onSubmit} className="stack">
        <label>
          {t.title}
          <input value={form.title} onChange={(e) => updateForm(setForm, "title", e.target.value)} required />
        </label>
        <label>
          {t.description}
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => updateForm(setForm, "description", e.target.value)}
            required
          />
        </label>
        <label>
          {t.category}
          <select value={form.category} onChange={(e) => updateForm(setForm, "category", e.target.value)}>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.location}
          <input value={form.location} onChange={(e) => updateForm(setForm, "location", e.target.value)} required />
        </label>
        <label>
          {t.image}
          <input type="file" accept="image/*" onChange={(e) => updateForm(setForm, "image", e.target.files?.[0] || null)} />
        </label>
        <button className="btn solid" type="submit">
          {t.submit}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </section>
  );
}
