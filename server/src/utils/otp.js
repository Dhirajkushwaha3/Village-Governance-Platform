export function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getOtpExpiryDate() {
  const minutes = Number(process.env.OTP_EXPIRY_MINUTES || 5);
  const now = new Date();
  return new Date(now.getTime() + minutes * 60 * 1000);
}

export function shouldAllowEscalation(createdAt) {
  const escalationHours = Number(process.env.ESCALATION_HOURS || 48);
  const threshold = createdAt.getTime() + escalationHours * 60 * 60 * 1000;
  return Date.now() >= threshold;
}
