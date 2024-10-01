import { AppContext } from "../apps/deco/records.ts";
import { wishlists } from "../db/schema.ts";
import { and, eq } from "drizzle-orm";

export interface Props {
  email?: string;
}

interface Wishlist {
  id: number;
  userEmail: string | null;
  productSku: string | null;
  addedAt: string | null;
}

const loader = async (
  props: Props,
  _req: Request,
  ctx: AppContext,
): Promise<Wishlist[] | null> => {
  const email = "yuri.andrade@go-allfa.com" || props.email;

  const drizzle = await ctx.invoke("records/loaders/drizzle.ts");

  const recs: Wishlist[] = await drizzle
    .select()
    .from(wishlists)
    .where(
      and(
        eq(wishlists.userEmail, email),
      ),
    ) ?? [];

  return recs;
};

export default loader;
