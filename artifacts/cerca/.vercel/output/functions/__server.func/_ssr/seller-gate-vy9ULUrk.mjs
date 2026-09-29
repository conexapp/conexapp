import { h as readSellerIntent, n as MINOR_SELL_BLOCK } from "./seller-profile-B9jvPmNx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/seller-gate-vy9ULUrk.js
async function assertCanSell(db, userId) {
	const rows = await db`
    select seller_intent from profiles where user_id = ${userId}
  `;
	if (readSellerIntent(rows[0]?.seller_intent ?? null)?.declaresMinor) throw new Error(MINOR_SELL_BLOCK);
}
//#endregion
export { assertCanSell as t };
