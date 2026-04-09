import seed from '../../../constants/seed.json'

export const seedPros = Array.isArray(seed?.professionals) ? seed.professionals : []

const sort = (arr) => arr.sort((a, b) => String(a).localeCompare(String(b)))

export const professionalIndustries = sort(Array.from(new Set(seedPros.map((p) => p?.industry).filter(Boolean))))
