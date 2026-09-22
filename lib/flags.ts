// Things that are built but not shown yet.
//
// A page is hidden in more than one place — the menu that links to it, any
// button that offers it, and the page itself, which has to refuse or it is
// still one typed URL away and still in anyone's search results. Keeping
// the decision in a single named constant means turning it back on is one
// edit rather than four, and the reason lives beside it.

/* The "how to buy" page: what the reader costs, what is free, and why a
   new title waits ninety days. Hidden while the terms are being settled —
   Stripe is most likely not being used at all, so a page quoting plans
   and prices is describing something that does not exist yet.

   Flip this to true and the menu item, the paywall's link and the page
   itself all come back together. */
export const PLANS_PAGE_LIVE = false;
