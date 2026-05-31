import type { MarketplaceListing, PriceMode, UserRole } from "./domain";
import { canRevealSellerContact } from "./verdict";

const PHONE_PATTERN = /(?:\+?\d[\s().-]?){8,}/;
const WHATSAPP_PATTERN = /(?:whatsapp|واتساب|واتس|wsp|wa\.me)/i;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

export function containsContactLeak(text: string): boolean {
  return PHONE_PATTERN.test(text) || WHATSAPP_PATTERN.test(text) || EMAIL_PATTERN.test(text);
}

export function sanitizeListingDescription(text: string): string {
  return text.replace(PHONE_PATTERN, "[contact bloque]").replace(EMAIL_PATTERN, "[email bloque]");
}

export function formatPrice(listing: Pick<MarketplaceListing, "priceMode" | "priceValue">): string {
  if (listing.priceMode === "on_request") return "Prix sur demande";
  if (listing.priceMode === "negotiable")
    return listing.priceValue ? `${listing.priceValue} DH negociable` : "Negociable";
  if (listing.priceMode === "price_per_gram") return `${listing.priceValue ?? 0} DH/g`;
  return `${listing.priceValue ?? 0} DH`;
}

export function defaultPriceMode(): PriceMode {
  return "fixed_total";
}

export function listingForRole(listing: MarketplaceListing, role: UserRole): MarketplaceListing {
  if (canRevealSellerContact(role, listing.status)) return listing;
  return {
    ...listing,
    sellerName: undefined,
    sellerPhone: undefined,
    sellerWhatsapp: undefined,
  };
}
