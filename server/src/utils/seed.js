import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Officer } from "../models/Officer.js";
import { Candidate } from "../models/Candidate.js";

dotenv.config();

const adminEmail = "admin@village.local";

const officers = [
  {
    name: "Divya Mittal",
    role: "DM",
    area: "District Headquarters",
    officeName: "District Magistrate Office",
    officeAddress: "Main Road, Block A",
    phone: "+919454417543",
    email: "dmdeo[at]nic[dot]in",
    contactDetails: "+91-9454417543"
  },
  {
    name: "Shruti Sharma",
    role: "SDM",
    area: "Tehsil North",
    officeName: "SDM Tehsil Office",
    officeAddress: "Collectorate Campus, Tehsil North",
    phone: "+91-0000000000",
    email: "xxxx@gov.in",
    contactDetails: "+91-0000000000"
  },
  {
    name: "blank",
    role: "blank",
    area: "blank",
    officeName: "blank",
    officeAddress: "blank",
    phone: "+91-0000000000",
    email: "xxxxxwater@gov.in",
    contactDetails: "+91-0000000000"
  }
];

const candidates = [
  {
    name: "RAMDYAL GOND",
    designation: "gram_pradhan",
    age: 42,
    mobileNumbers: ["+91-9554329949", "+91-6392832262"],
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    tagline: "Clean water, safer roads",
    education: "10Th Pass",
    experience: "8 years in local self-help groups",
    promises: ["street light ", "Monthly gram sabha report"],
    contactInfo: "+91-9554329949",
    area: "Ward 1",
    verificationStatus: "approved"
  },
  {
    name: "Test Candidate 1",
    designation: "member",
    age: 36,
    mobileNumbers: ["+91-0000000000"],
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    tagline: "Electricity and youth jobs",
    education: "Diploma in Civil Works",
    experience: "Former panchayat volunteer",
    promises: ["Street light in every lane", "Skill center for youth"],
    contactInfo: "+91-0000000000",
    area: "Ward 2",
    verificationStatus: "approved"
  },
  {
    name: "Test Candidate 2",
    designation: "member",
    age: 33,
    mobileNumbers: ["+91-9100000000", "+91-9100000000"],
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600",
    tagline: "Sanitation and school support",
    education: "M.A. Sociology",
    experience: "6 years in village development committee",
    promises: ["Weekly cleanliness drive", "Girls scholarship help desk"],
    contactInfo: "+91-9100000000",
    area: "Ward 3",
    verificationStatus: "approved"
  }
];

async function ensureAdminUser() {
  const adminExists = await User.findOne({ email: adminEmail });

  if (!adminExists) {
    await User.create({
      name: "Platform Admin",
      email: adminEmail,
      role: "admin"
    });
    console.log("Admin user created: admin@village.local");
  }
}

async function seedOfficers() {
  for (const officer of officers) {
    await Officer.findOneAndUpdate(
      { name: officer.name },
      { $set: officer },
      { upsert: true, new: true }
    );
  }


  const seededNames = officers.map((item) => item.name);
  await Officer.deleteMany({ name: { $nin: seededNames } });
}

async function seedCandidates() {
  for (const candidate of candidates) {
    await Candidate.findOneAndUpdate(
      { name: candidate.name },
      { $set: candidate },
      { upsert: true, new: true }
    );
  }

 
  const seededNames = candidates.map((item) => item.name);
  await Candidate.deleteMany({
    user: { $exists: false },
    name: { $nin: seededNames }
  });
}

async function run() {
  await connectDB();
  await ensureAdminUser();
  await seedOfficers();
  await seedCandidates();

  console.log("Seed completed");
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
