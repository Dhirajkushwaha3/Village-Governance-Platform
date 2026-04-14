import mongoose from "mongoose";

async function removeLegacyOtpPhoneIndex() {
  try {
    const otpCollection = mongoose.connection.collection("otpcodes");
    const indexes = await otpCollection.indexes();
    const hasLegacyPhoneIndex = indexes.some((index) => index.name === "phone_1");

    if (hasLegacyPhoneIndex) {
      await otpCollection.dropIndex("phone_1");
      console.log("Removed legacy index otpcodes.phone_1");
    }
  } catch (error) {
   
    if (error.codeName !== "NamespaceNotFound") {
      console.warn("Could not check legacy OTP indexes:", error.message);
    }
  }
}

async function removeLegacyUserPhoneIndex() {
  try {
    const userCollection = mongoose.connection.collection("users");
    const indexes = await userCollection.indexes();
    const hasLegacyPhoneIndex = indexes.some((index) => index.name === "phone_1");

    if (hasLegacyPhoneIndex) {
      await userCollection.dropIndex("phone_1");
      console.log("Removed legacy index users.phone_1");
    }
  } catch (error) {
   
    if (error.codeName !== "NamespaceNotFound") {
      console.warn("Could not check legacy user indexes:", error.message);
    }
  }
}

export async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in environment variables");
  }

  await mongoose.connect(mongoUri);
  await removeLegacyOtpPhoneIndex();
  await removeLegacyUserPhoneIndex();

  console.log("MongoDB connected");
}
