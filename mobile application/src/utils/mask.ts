export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}***@${domain}`;
}

export function maskMobile(mobileNumber: string): string {
  const digits = mobileNumber.replace(/\D/g, '').slice(-10);
  const last4 = digits.slice(-4);
  return `+91 ****** ${last4}`;
}
