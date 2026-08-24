import { CATEGORIES, LISTINGS } from "@/lib/mock-data";
import { Listing, QuoteRequest } from "@/lib/types/domain";

// Store en memoria del proceso, SOLO para desarrollo/demo sin Supabase todavia.
// Se reinicia cada vez que se reinicia `npm run dev`. El dia que haya credenciales
// reales de Supabase, este archivo se reemplaza por consultas a la base de datos
// y el resto de la app (que solo importa lib/data/listings.ts) no deberia cambiar.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalStore = globalThis as any;

if (!globalStore.__paseoTextilListings) {
  globalStore.__paseoTextilListings = [...LISTINGS] as Listing[];
}

export function getStoreListings(): Listing[] {
  return globalStore.__paseoTextilListings as Listing[];
}

export function addStoreListing(listing: Listing) {
  (globalStore.__paseoTextilListings as Listing[]).unshift(listing);
}

export function getStoreCategories() {
  return CATEGORIES;
}

if (!globalStore.__paseoTextilQuotes) {
  globalStore.__paseoTextilQuotes = [] as QuoteRequest[];
}

export function addStoreQuote(quote: QuoteRequest) {
  (globalStore.__paseoTextilQuotes as QuoteRequest[]).unshift(quote);
}
