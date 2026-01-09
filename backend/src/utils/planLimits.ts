export const PLAN_LIMITS = {
  free: {
    maxInvoicesPerMonth: 20,
    maxClients: 10,
    maxUsers: 1,
    maxStorageMB: 100, // 100 MB
    features: ["B02", "B01"],
  },
  entrepreneur: {
    maxInvoicesPerMonth: 9999, // Essentially unlimited
    maxClients: 9999,
    maxUsers: 1,
    maxStorageMB: 1024, // 1 GB
    features: ["B01", "B02"],
  },
  pyme: {
    maxInvoicesPerMonth: 9999,
    maxClients: 9999,
    maxUsers: 3,
    maxStorageMB: 5120, // 5 GB
    features: [
      "B01",
      "B02",
      "Mobile App",
      "Basic Reports",
      "Electronic Invoicing",
    ],
  },
  enterprise: {
    maxInvoicesPerMonth: 9999,
    maxClients: 9999,
    maxUsers: 9999,
    maxStorageMB: 20480, // 20 GB
    features: ["All"],
  },
};

export type PlanType = keyof typeof PLAN_LIMITS;

export const getPlanLimits = (plan: string = "free") => {
  return PLAN_LIMITS[plan as PlanType] || PLAN_LIMITS.free;
};
