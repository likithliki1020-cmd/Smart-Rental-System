export const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  tenant: "Tenant",
  manager: "Manager",
  admin: "Admin",
};

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  commercial: "Commercial",
};

// Each status maps to a "tone" that StatusBadge translates into
// the ledger-stamp color (brass / forest / amber / rust / ink).
type Tone = "brass" | "forest" | "amber" | "rust" | "ink";

export const PROPERTY_STATUS: Record<string, { label: string; tone: Tone }> = {
  vacant: { label: "Vacant", tone: "brass" },
  occupied: { label: "Occupied", tone: "forest" },
  maintenance: { label: "Maintenance", tone: "amber" },
};

export const LEASE_STATUS: Record<string, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "forest" },
  pending: { label: "Pending", tone: "amber" },
  inactive: { label: "Inactive", tone: "ink" },
};

export const PAYMENT_STATUS: Record<string, { label: string; tone: Tone }> = {
  paid: { label: "Paid", tone: "forest" },
  pending: { label: "Pending", tone: "amber" },
  overdue: { label: "Overdue", tone: "rust" },
};

export const MAINTENANCE_STATUS: Record<string, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "rust" },
  in_progress: { label: "In Progress", tone: "amber" },
  closed: { label: "Closed", tone: "forest" },
};

export const MAINTENANCE_CATEGORY_LABELS: Record<string, string> = {
  plumbing: "Plumbing",
  electrical: "Electrical",
  cleaning: "Cleaning",
  other: "Other",
};

export const NAV_ICON_BY_LABEL: Record<string, string> = {
  Overview: "LayoutDashboard",
  Properties: "Building2",
  Tenants: "Users",
  Payments: "Wallet",
  Messages: "MessageCircle",
  "My Lease": "FileText",
  Maintenance: "Wrench",
  Reports: "BarChart3",
  Users: "UserCog",
  Settings: "Settings",
};

export const NAV_BY_ROLE: Record<
  string,
  { code: string; label: string; href: string }[]
> = {
  owner: [
    { code: "01", label: "Overview", href: "/owner" },
    { code: "02", label: "Properties", href: "/owner/properties" },
    { code: "03", label: "Tenants", href: "/owner/tenants" },
    { code: "04", label: "Payments", href: "/owner/payments" },
    { code: "05", label: "Messages", href: "/owner/messages" },
  ],
  tenant: [
    { code: "01", label: "Overview", href: "/tenant" },
    { code: "02", label: "My Lease", href: "/tenant/lease" },
    { code: "03", label: "Payments", href: "/tenant/payments" },
    { code: "04", label: "Maintenance", href: "/tenant/maintenance" },
    { code: "05", label: "Messages", href: "/tenant/messages" },
  ],
  manager: [
    { code: "01", label: "Overview", href: "/manager" },
    { code: "02", label: "Properties", href: "/manager/properties" },
    { code: "03", label: "Tenants", href: "/manager/tenants" },
    { code: "04", label: "Maintenance", href: "/manager/maintenance" },
    { code: "05", label: "Reports", href: "/manager/reports" },
  ],
  admin: [
    { code: "01", label: "Overview", href: "/admin" },
    { code: "02", label: "Users", href: "/admin/users" },
    { code: "03", label: "Settings", href: "/admin/settings" },
  ],
};