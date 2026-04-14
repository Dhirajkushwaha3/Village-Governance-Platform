import nodemailer from "nodemailer";
import dns from "node:dns";

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

function shouldForceIpv4() {
  const raw = String(process.env.EMAIL_FORCE_IPV4 || "").trim().toLowerCase();
  if (!raw) return isProduction;
  return raw === "true" || raw === "1" || raw === "yes";
}

async function resolveIpv4Host(hostname) {
  try {
    const addresses = await dns.promises.resolve4(hostname);
    if (addresses.length > 0) {
      return addresses[0];
    }
  } catch {
    // Fall back to hostname if DNS IPv4 resolution is unavailable.
  }

  return hostname;
}

async function createTransportConfig(emailService, emailUser, emailPass) {
  const forceIpv4 = shouldForceIpv4();
  const connectionTimeout = Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS || 15000);
  const smtpHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const resolvedHost = forceIpv4 ? await resolveIpv4Host(smtpHost) : smtpHost;

  if (emailService.toLowerCase() === "gmail") {
    return {
      host: resolvedHost,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: false,
      requireTLS: true,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        servername: smtpHost,
        family: forceIpv4 ? 4 : undefined
      },
      connectionTimeout
    };
  }

  return {
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPass
    },
    connectionTimeout
  };
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
    const transportConfig = await createTransportConfig(emailService, emailUser, emailPass);
    const transporter = nodemailer.createTransport(transportConfig);

    await transporter.sendMail({
      from: emailUser,
      to: email,
      subject: "Your OTP - Village Governance",
      text: `Your OTP is: ${otp}\n\nValid for 10 minutes.`
    });
  } catch (error) {
    logOtpInConsole(email, otp);
    console.error("Email error:", error.message);
    throw new Error("OTP email failed. Check EMAIL settings (EMAIL_USER, EMAIL_PASSWORD, EMAIL_FORCE_IPV4).");
  }
}
