import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CandidatesPage from "./pages/CandidatesPage";
import CandidateDetailsPage from "./pages/CandidateDetailsPage";
import ComplaintsPage from "./pages/ComplaintsPage";
import SubmitComplaintPage from "./pages/SubmitComplaintPage";
import OfficersPage from "./pages/OfficersPage";
import OfficerDetailsPage from "./pages/OfficerDetailsPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/:id" element={<CandidateDetailsPage />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route
          path="/submit"
          element={
            <RequireAuth>
              <SubmitComplaintPage />
            </RequireAuth>
          }
        />
        <Route path="/officers" element={<OfficersPage />} />
        <Route path="/officers/:id" element={<OfficerDetailsPage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
      </Routes>
    </Layout>
  );
}
