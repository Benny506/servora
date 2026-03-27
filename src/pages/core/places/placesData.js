import seed from '../../../constants/seed.json'

export const places = Array.isArray(seed?.places) ? seed.places : []

const sort = (arr) => arr.sort((a, b) => String(a).localeCompare(String(b)))

export const placeCategories = sort(Array.from(new Set(places.map((p) => p?.category).filter(Boolean))))
export const placeCities = sort(Array.from(new Set(places.map((p) => p?.location?.city).filter(Boolean))))
export const placePriceRanges = sort(Array.from(new Set(places.map((p) => p?.meta?.price_range).filter(Boolean))))
