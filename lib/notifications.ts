export function activeAlertCondition(alias = "a") {
  return `${alias}.is_active = TRUE AND (${alias}.expires_at IS NULL OR ${alias}.expires_at > NOW())`;
}