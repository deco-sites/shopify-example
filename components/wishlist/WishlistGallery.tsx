import { AppContext } from "../../apps/site.ts";
import SearchResult, {
  Props as SearchResultProps,
} from "../search/SearchResult.tsx";
import { type SectionProps } from "@deco/deco";

export type Props = SearchResultProps;

function WishlistGallery(props: Awaited<SectionProps<typeof loader>>) {
  const isEmpty = !props.page || !props.page.products ||
    props.page.products.length === 0;

  if (isEmpty) {
    return (
      <div class="container mx-4 sm:mx-auto">
        <div class="mx-10 my-20 flex flex-col gap-4 justify-center items-center">
          <span class="font-medium text-2xl">Your wishlist is empty</span>
          <span>
            Log in and add items to your wishlist for later. They will show up
            here
          </span>
        </div>
      </div>
    );
  }

  return <SearchResult {...props} />;
}

export const loader = async (props: Props, req: Request, ctx: AppContext) => {
  const response = await (ctx as unknown as AppContext).invoke(
    "site/loaders/get-my-wishlist.ts",
  );

  if (!response || response.length === 0) {
    return {
      ...props,
      page: {
        products: [],
        ...props.page,
      },
      url: req.url,
    };
  }

  const favoritedIds = response.map((item) => item.productSku);

  const favoritedProducts =
    props.page?.products.filter((item) =>
      favoritedIds.includes(item.productID)
    ) ?? [];

  return {
    ...props,
    page: {
      products: favoritedProducts,
      ...props.page,
    },
    url: req.url,
  };
};

export default WishlistGallery;
