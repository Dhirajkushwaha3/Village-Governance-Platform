import { createContext, useContext, useState } from "react";

const dictionary = {
  en: {
    appName: "Village Governance Platform",
    navHome: "Home",
    navCandidates: "Candidates",
    navComplaints: "Complaints",
    navSubmit: "Submit",
    navOfficers: "Officers",
    navDashboard: "Dashboard",
    navLogin: "Login",
    heroTitle: "Your Village, Your Voice",
    heroText: "Track public issues, compare candidates, and keep governance transparent.",
    statComplaints: "Total Complaints",
    statResolved: "Resolved",
    statPending: "Pending",
    statCandidates: "Active Candidates",
    quickStart: "Quick Start",
    quickStartText: "Login with your email, then raise complaints with location and image proof.",
    loginTitle: "Login",
    name: "Name",
    role: "Role",
    otp: "OTP",
    requestOtp: "Request OTP",
    verifyOtp: "Verify & Login",
    user: "User",
    candidate: "Candidate",
    candidatesTitle: "Election Candidates",
    compare: "Compare",
    remove: "Remove",
    compareNow: "Compare Selected",
    details: "Details",
    verified: "Approved",
    pending: "Pending",
    registerCandidate: "Register as Candidate",
    complaintsTitle: "Public Complaints",
    upvote: "Upvote",
    respond: "Respond",
    status: "Status",
    escalate: "Escalate",
    submitComplaint: "Submit Complaint",
    title: "Title",
    description: "Description",
    category: "Category",
    location: "Location",
    image: "Image",
    submit: "Submit",
    officersTitle: "Government Officers Directory",
    search: "Search",
    area: "Area",
    contact: "Contact",
    dashboardTitle: "Transparency Dashboard",
    education: "Education",
    experience: "Experience",
    promises: "Promises",
    contactInfo: "Contact Info",
    logout: "Logout",
    onlyLoggedIn: "Login is required for this action"
  },
  hi: {
    appName: "ग्राम शासन मंच",
    navHome: "होम",
    navCandidates: "उम्मीदवार",
    navComplaints: "शिकायतें",
    navSubmit: "शिकायत दर्ज करें",
    navOfficers: "अधिकारी",
    navDashboard: "डैशबोर्ड",
    navLogin: "लॉगिन",
    heroTitle: "आपका गांव, आपकी आवाज",
    heroText: "जन समस्याएं ट्रैक करें, उम्मीदवारों की तुलना करें और शासन को पारदर्शी बनाएं।",
    statComplaints: "कुल शिकायतें",
    statResolved: "समाधान हुई",
    statPending: "लंबित",
    statCandidates: "सक्रिय उम्मीदवार",
    quickStart: "शुरुआत कैसे करें",
    quickStartText: "मोबाइल नंबर से लॉगिन करें, फिर लोकेशन और फोटो के साथ शिकायत दर्ज करें।",
    loginTitle: "लॉगिन",
    name: "नाम",
    role: "भूमिका",
    otp: "OTP",
    requestOtp: "OTP भेजें",
    verifyOtp: "सत्यापित करें और लॉगिन करें",
    user: "नागरिक",
    candidate: "उम्मीदवार",
    candidatesTitle: "चुनावी उम्मीदवार",
    compare: "तुलना",
    remove: "हटाएं",
    compareNow: "चयनित की तुलना",
    details: "विवरण",
    verified: "स्वीकृत",
    pending: "लंबित",
    registerCandidate: "उम्मीदवार पंजीकरण",
    complaintsTitle: "सार्वजनिक शिकायतें",
    upvote: "समर्थन वोट",
    respond: "जवाब दें",
    status: "स्थिति",
    escalate: "एस्केलेट करें",
    submitComplaint: "शिकायत दर्ज करें",
    title: "शीर्षक",
    description: "विवरण",
    category: "श्रेणी",
    location: "स्थान",
    image: "छवि",
    submit: "जमा करें",
    officersTitle: "सरकारी अधिकारी निर्देशिका",
    search: "खोजें",
    area: "क्षेत्र",
    contact: "संपर्क",
    dashboardTitle: "पारदर्शिता डैशबोर्ड",
    education: "शिक्षा",
    experience: "अनुभव",
    promises: "वायदे",
    contactInfo: "संपर्क जानकारी",
    logout: "लॉगआउट",
    onlyLoggedIn: "इस कार्य के लिए लॉगिन जरूरी है"
  }
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: dictionary[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
