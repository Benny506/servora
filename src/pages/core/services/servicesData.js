import seed from '../../../constants/seed.json'

export const seedServices = Array.isArray(seed?.services) ? seed.services : []

const sort = (arr) => arr.sort((a, b) => String(a).localeCompare(String(b)))

export const serviceCategories = sort(Array.from(new Set(seedServices.map((s) => s?.category).filter(Boolean))))
