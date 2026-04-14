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
  const connectionTimeout = Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS || 30000);
  const socketTimeout = Number(process.env.EMAIL_SOCKET_TIMEOUT_MS || 45000);
  const smtpHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const resolvedHost = forceIpv4 ? await resolveIpv4Host(smtpHost) : smtpHost;

  if (emailService.toLowerCase() === "gmail") {
    const primaryPort = Number(process.env.EMAIL_PORT || 587);
    const primarySecure = String(process.env.EMAIL_SECURE || "").trim().toLowerCase() === "true";
    const profiles = [
      { port: primaryPort, secure: primarySecure },
      { port: 587, secure: false },
      { port: 465, secure: true }
    ];

    const uniqueProfiles = profiles.filter((profile, index, list) => {
      return index === list.findIndex((item) => item.port === profile.port && item.secure === profile.secure);
    });

    return uniqueProfiles.map((profile) => ({
      host: resolvedHost,
      port: profile.port,
      secure: profile.secure,
      requireTLS: !profile.secure,
      auth: {
        user: emailUser,
        pass: emailPass
      },
      tls: {
        servername: smtpHost,
        family: forceIpv4 ? 4 : undefined
      },
      connectionTimeout,
      greetingTimeout: connectionTimeout,
      socketTimeout
    }));
  }

  return [{
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPass
    },
    connectionTimeout,
    greetingTimeout: connectionTimeout,
    socketTimeout
  }];
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
    const transportConfigs = await createTransportConfig(emailService, emailUser, emailPass);
    let lastError;

    for (const config of transportConfigs) {
      try {
        const transporter = nodemailer.createTransport(config);

        await transporter.sendMail({
          from: emailUser,
          to: email,
          subject: "Your OTP - Village Governance",
          text: `Your OTP is: ${otp}\n\nValid for 10 minutes.`
        });

        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error("All email transport attempts failed");
  } catch (error) {
    logOtpInConsole(email, otp);
    console.error("Email error:", error.message);
    throw new Error("OTP email failed. Check EMAIL settings (EMAIL_USER, EMAIL_PASSWORD, EMAIL_FORCE_IPV4, EMAIL_PORT, EMAIL_SECURE).");
  }
}
