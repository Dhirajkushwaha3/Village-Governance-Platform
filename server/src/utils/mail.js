import nodemailer from "nodemailer";

const isProduction = process.env.NODE_ENV === "production";

function logOtpInConsole(email, otp) {
  if (isProduction) {
    console.warn(`[OTP] Delivery fallback used for ${email}`);
    return;
  }

  console.log(`[OTP] To: ${email}`);
  console.log(`[OTP] Code: ${otp}`);
}

function hasEmailConfig() {
  return Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);
}

export async function sendOtpEmail(email, otp) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASSWORD;
  const emailService = process.env.EMAIL_SERVICE || "gmail";

  // If no email config, just log to console
  if (!hasEmailConfig()) {
    if (isProduction) {
      throw new Error("OTP email is not configured on server");
    }

    logOtpInConsole(email, otp);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: emailService,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: "Your OTP - Village Governance",
      text: `Your OTP is: ${otp}\n\nValid for 10 minutes.`
    });
  } catch (error) {
    logOtpInConsole(email, otp);
    console.error("Email error:", error.message);
    throw new Error("OTP email failed. Check EMAIL_USER and EMAIL_PASSWORD in server/.env.");
  }
}
