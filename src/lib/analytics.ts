/**
 * GA4 E-commerce Event Tracking
 * 
 * These functions send standard GA4 e-commerce events for product tracking.
 * They automatically check if gtag is available (i.e., user has added GA4 code
 * via the Admin Dashboard → Analytics Code tab).
 * 
 * If gtag is not loaded, events silently skip — no errors.
 */

interface TrackProduct {
  id: number;
  title: string;
  price: number;
  category?: string;
  brand?: string;
  currency?: string;
}

/** Check if GA4 gtag is available */
function gtagAvailable(): boolean {
  return typeof window !== "undefined" && !!(window as any).gtag;
}

/** Send a GA4 event */
function sendEvent(eventName: string, params: Record<string, any>) {
  if (!gtagAvailable()) return;
  try {
    (window as any).gtag("event", eventName, params);
  } catch {
    // Silently ignore gtag errors
  }
}

/** Track when user views a product list (e.g., a category or brand section) */
export function trackViewItemList(
  listId: string,
  listName: string,
  products: TrackProduct[],
  currency: string = "USD"
) {
  if (!gtagAvailable() || products.length === 0) return;
  sendEvent("view_item_list", {
    item_list_id: listId,
    item_list_name: listName,
    items: products.map((p, index) => ({
      item_id: String(p.id),
      item_name: p.title,
      item_category: p.category || "",
      item_brand: p.brand || "",
      price: p.price,
      currency: p.currency || currency,
      index,
    })),
  });
}

/** Track when user clicks/selects a product */
export function trackSelectItem(
  listId: string,
  listName: string,
  product: TrackProduct,
  currency: string = "USD"
) {
  if (!gtagAvailable()) return;
  sendEvent("select_item", {
    item_list_id: listId,
    item_list_name: listName,
    items: [
      {
        item_id: String(product.id),
        item_name: product.title,
        item_category: product.category || "",
        item_brand: product.brand || "",
        price: product.price,
        currency: product.currency || currency,
      },
    ],
  });
}

/** Track when user views a single product detail page */
export function trackViewItem(product: TrackProduct, currency: string = "USD") {
  if (!gtagAvailable()) return;
  sendEvent("view_item", {
    currency: product.currency || currency,
    value: product.price,
    items: [
      {
        item_id: String(product.id),
        item_name: product.title,
        item_category: product.category || "",
        item_brand: product.brand || "",
        price: product.price,
        currency: product.currency || currency,
      },
    ],
  });
}

/** Track when user clicks external affiliate link */
export function trackClickAffiliate(product: TrackProduct, currency: string = "USD") {
  if (!gtagAvailable()) return;
  sendEvent("click_affiliate", {
    currency: product.currency || currency,
    value: product.price,
    items: [
      {
        item_id: String(product.id),
        item_name: product.title,
        item_category: product.category || "",
        item_brand: product.brand || "",
        price: product.price,
        currency: product.currency || currency,
      },
    ],
  });
}
