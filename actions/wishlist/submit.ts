import { type AppContext } from "../../apps/site.ts";
import { type Wishlist } from "../../components/wishlist/Provider.tsx";
import { usePlatform } from "../../sdk/usePlatform.tsx";
import type { AppContext as RecordsApp } from "../../apps/deco/records.ts";

import { AppContext as AppContextVTEX } from "apps/vtex/mod.ts";
import { wishlists } from "../../db/schema.ts";
import { and, eq } from "drizzle-orm";

interface Props {
  productID: string;
  productGroupID: string;
}

async function action(
  props: Props,
  _req: Request,
  ctx: AppContext & RecordsApp,
): Promise<Wishlist> {
  const { productID, productGroupID } = props;
  const platform = usePlatform();

  if (platform === "vtex") {
    const vtex = ctx as unknown as AppContextVTEX;

    const list = await vtex.invoke("vtex/loaders/wishlist.ts");
    const item = list.find((i) => i.sku === productID);

    try {
      const response = item
        ? await vtex.invoke(
          "vtex/actions/wishlist/removeItem.ts",
          { id: item.id },
        )
        : await vtex.invoke(
          "vtex/actions/wishlist/addItem.ts",
          { sku: productID, productId: productGroupID },
        );

      return {
        productIDs: response.map((item) => item.sku),
      };
    } catch {
      return {
        productIDs: list.map((item) => item.sku),
      };
    }
  }

  if (platform === "shopify") {
    const drizzle = await ctx.invoke("records/loaders/drizzle.ts");

    const email = "yuri.andrade@go-allfa.com";

    const recs = await drizzle
      .select()
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userEmail, email),
          eq(wishlists.productSku, productID),
        ),
      );

    if (recs.length) {
      await drizzle
        .delete(wishlists)
        .where(
          and(
            eq(wishlists.userEmail, email),
            eq(wishlists.productSku, productID),
          ),
        );

      const response = await (ctx as unknown as AppContext).invoke(
        "site/loaders/get-my-wishlist.ts",
      );

      return {
        productIDs: response.map((item) => item.productSku),
      };
    }

    await drizzle.insert(wishlists).values({
      userEmail: email,
      productSku: productID,
      addedAt: new Date().toString(),
    });

    const response = await (ctx as unknown as AppContext).invoke(
      "site/loaders/get-my-wishlist.ts",
    );

    return {
      productIDs: response.map((item) => item.productSku),
    };
  }

  throw new Error(`Unsupported platform: ${platform}`);
}

export default action;
