import { Database } from './database.types'

type Coupon = Database['public']['Tables']['coupons']['Row']

/**
 * Selects a coupon based on weighted probability derived from its level.
 * Level 1: Common (Highest weight)
 * Level 2: Rare
 * Level 3: Legendary (Lowest weight)
 * 
 * Formula: Weight = 1 / (Level^2) (or any other decay function)
 * Adjust weights as needed for desired distribution.
 */
export function selectWeightedCoupon(coupons: Coupon[]): Coupon | null {
    // 1. Filter available coupons
    const availableCoupons = coupons.filter(c => c.quantity > 0)

    if (availableCoupons.length === 0) return null

    // 2. Calculate weights
    // Level 1: Weight 10
    // Level 2: Weight 3
    // Level 3: Weight 1
    const getWeight = (level: number) => {
        switch (level) {
            case 1: return 60
            case 2: return 30
            case 3: return 10
            default: return 10 // Fallback for unknown levels
        }
    }

    // 3. Create weighted pool
    const weightedPool: { coupon: Coupon; weight: number }[] = availableCoupons.map(c => ({
        coupon: c,
        weight: getWeight(c.level)
    }))

    const totalWeight = weightedPool.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight

    // 4. Select based on random value
    for (const item of weightedPool) {
        if (random < item.weight) {
            return item.coupon
        }
        random -= item.weight
    }

    return availableCoupons[0] // Fallback
}
