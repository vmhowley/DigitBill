
export const PLAN_LIMITS = {
    free: {
        maxInvoicesPerMonth: 5,
        maxClients: 10,
        maxUsers: 1,
        features: ['B02', 'B01']
    },
    entrepreneur: {
        maxInvoicesPerMonth: 9999, // Essentially unlimited
        maxClients: 9999,
        maxUsers: 1,
        features: ['B01', 'B02']
    },
    pyme: {
        maxInvoicesPerMonth: 9999,
        maxClients: 9999,
        maxUsers: 3,
        features: ['B01', 'B02', 'Mobile App', 'Basic Reports']
    },
    enterprise: {
        maxInvoicesPerMonth: 9999,
        maxClients: 9999,
        maxUsers: 9999,
        features: ['All']
    }
};

export type PlanType = keyof typeof PLAN_LIMITS;

export const getPlanLimits = (plan: string = 'free') => {
    return PLAN_LIMITS[plan as PlanType] || PLAN_LIMITS.free;
};
