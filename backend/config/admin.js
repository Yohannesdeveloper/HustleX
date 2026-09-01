const DEFAULT_ADMIN_EMAIL = "hustlexet@gmail.com";

function getAdminEmail() {
  return (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase().trim();
}

function isDesignatedAdminEmail(email) {
  if (!email) return false;
  return email.toLowerCase().trim() === getAdminEmail();
}

/**
 * Ensures the designated admin email always has admin role in the database.
 */
async function ensureAdminRole(user) {
  if (!user || !isDesignatedAdminEmail(user.email)) {
    return user;
  }

  let changed = false;

  if (!Array.isArray(user.roles)) {
    user.roles = [];
  }
  if (!user.roles.includes("admin")) {
    user.roles.push("admin");
    changed = true;
  }
  if (user.currentRole !== "admin") {
    user.currentRole = "admin";
    changed = true;
  }

  if (changed) {
    await user.save();
  }

  return user;
}

function getEffectiveRole(user) {
  if (user?.roles?.includes("admin")) {
    return "admin";
  }
  return user?.currentRole;
}

function toAuthUserPayload(user, extras = {}) {
  const effectiveRole = getEffectiveRole(user);
  return {
    _id: user._id,
    email: user.email,
    roles: user.roles,
    currentRole: effectiveRole,
    role: effectiveRole,
    profile: user.profile,
    ...extras,
  };
}

module.exports = {
  getAdminEmail,
  isDesignatedAdminEmail,
  ensureAdminRole,
  getEffectiveRole,
  toAuthUserPayload,
};
