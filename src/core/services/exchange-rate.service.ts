// core/services/exchange-rate.service.ts
import axios from "axios";

const FALLBACK_BDT_TO_USD_RATE = 0.0084; // update periodically as a safety net

let cachedRate: { rate: number; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — exchange rates don't need to be real-time

export async function getBdtToUsdRate(): Promise<number> {
    if (cachedRate && Date.now() - cachedRate.fetchedAt < CACHE_TTL_MS) {
        return cachedRate.rate;
    }

    try {
        // exchangerate-api.com free tier, or swap for any provider you prefer
        const { data } = await axios.get(`https://api.exchangerate-api.com/v4/latest/BDT`);
        const rate = data.rates.USD;
        cachedRate = { rate, fetchedAt: Date.now() };
        return rate;
    } catch (error) {
        console.error("Exchange rate fetch failed, using fallback rate:", error);
        return FALLBACK_BDT_TO_USD_RATE;
    }
}
