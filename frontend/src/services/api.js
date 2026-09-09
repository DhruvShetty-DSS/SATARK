import {
  mockDashboard,
  mockWorks,
  mockVendors,
  mockPublic,
} from "../data/mockData";

// ---------------------------------------------------------------------------
// Config — swap BASE_URL to point at a live FastAPI backend; components stay
// unchanged because all data flows through these same function signatures.
// ---------------------------------------------------------------------------
const BASE_URL = ""; // e.g. "http://localhost:8000" in production
const USE_MOCK = true; // set false once FastAPI is running

async function apiFetch(path) {
  if (USE_MOCK) return null; // handled below per-endpoint
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status} for ${path}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

/** GET /api/dashboard — aggregate stats + district breakdown */
export async function getDashboard() {
  if (USE_MOCK) return mockDashboard;
  return apiFetch("/api/dashboard");
}

/**
 * GET /api/works — full worklist, sorted descending by risk_score.
 * @param {Object} params  optional { district, riskLevel, search }
 */
export async function getWorks(params = {}) {
  if (USE_MOCK) {
    let works = [...mockWorks].sort((a, b) => b.riskScore - a.riskScore);
    if (params.district)
      works = works.filter((w) => w.district === params.district);
    if (params.riskLevel)
      works = works.filter((w) => w.riskLevel === params.riskLevel);
    if (params.search) {
      const q = params.search.toLowerCase();
      works = works.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.district.toLowerCase().includes(q)
      );
    }
    return works;
  }
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/api/works${qs ? `?${qs}` : ""}`);
}

/**
 * GET /api/works/:id — single work detail record.
 */
export async function getWork(id) {
  if (USE_MOCK) {
    const w = mockWorks.find((w) => w.id === Number(id));
    if (!w) throw new Error(`Work ${id} not found`);
    return w;
  }
  return apiFetch(`/api/works/${id}`);
}

/**
 * GET /api/vendors/:id — vendor profile + associated works.
 */
export async function getVendor(id) {
  if (USE_MOCK) {
    const vendor = mockVendors[id];
    if (!vendor) throw new Error(`Vendor ${id} not found`);
    const works = vendor.works.map((wid) =>
      mockWorks.find((w) => w.id === wid)
    );
    return { ...vendor, worksDetail: works };
  }
  return apiFetch(`/api/vendors/${id}`);
}

/**
 * GET /api/public — citizen-facing summary.
 */
export async function getPublicView() {
  if (USE_MOCK) return mockPublic;
  return apiFetch("/api/public");
}

/**
 * POST /api/works/:id/flag — flag a work for inspection.
 */
export async function flagWork(id) {
  if (USE_MOCK) return { success: true, workId: id };
  const res = await fetch(`${BASE_URL}/api/works/${id}/flag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Flag failed ${res.status}`);
  return res.json();
}
