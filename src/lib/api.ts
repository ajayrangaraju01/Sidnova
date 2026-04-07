const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

function apiRequest(path: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, init);
}

function adminRequest(path: string, init?: RequestInit) {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
  });
}

export interface TeamMemberPayload {
  name: string;
  hallTicketNumber: string;
}

export interface RegistrationPayload {
  eventSlug: string;
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  hallTicketNumber?: string;
  branch?: string;
  year?: string;
  teamName?: string;
  teamMembers?: TeamMemberPayload[];
  speakerName?: string;
  agendaPreference?: string;
  englishOnlyConfirmed?: boolean;
}

export interface RegistrationRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  college: string;
  course: string;
  hallTicketNumber: string;
  branch: string;
  year: string;
  teamName: string;
  teamMembers: TeamMemberPayload[];
  extraDetails: Record<string, string | boolean>;
  submittedAt: string;
}

export interface AdminEventOverview {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  registrationCount: number;
  registrations: RegistrationRecord[];
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function submitRegistration(payload: RegistrationPayload) {
  const response = await apiRequest(`/api/registrations/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error ?? "Registration failed.", response.status);
  }

  return data;
}

export async function adminLogin(password: string) {
  const response = await adminRequest(`/api/admin/login/`, {
    method: "POST",
    body: JSON.stringify({ password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error ?? "Admin login failed.", response.status);
  }

  return data;
}

export async function adminLogout() {
  const response = await adminRequest(`/api/admin/logout/`, {
    method: "POST",
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error ?? "Admin logout failed.", response.status);
  }

  return data;
}

export async function getAdminSession() {
  const response = await adminRequest(`/api/admin/session/`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error ?? "Unable to check admin session.", response.status);
  }

  return data as { authenticated: boolean };
}

export async function getAdminOverview() {
  const response = await adminRequest(`/api/admin/overview/`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error ?? "Unable to load admin overview.", response.status);
  }

  return data as { events: AdminEventOverview[] };
}

export function getAdminExportUrl(slug?: string) {
  if (!slug) {
    return `${API_BASE_URL}/api/admin/export/all/`;
  }

  return `${API_BASE_URL}/api/admin/export/${slug}/`;
}
