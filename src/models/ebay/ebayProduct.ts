export default interface ebayProduct   {
  itemId: string,
  title: string,
  leafCategoryIds: number[],
  categories: {
      categoryId: number
      categoryName: string
    }[]
  image: {
    imageUrl: string
  },
  price: {
    value: number,
    currency: string
  },
  itemHref: string,
  seller: {
    username: string,
    feedbackPercentage: number,
    feedbackScore: number,
    sellerAccountType: string
  },
  condition: string,
  conditionId: number,
  thumbnailImages: {
      imageUrl: string
    }[],
  shippingOptions: 
    {
      shippingCostType: string,
      shippingCost: {
        value: 0.00,
        currency: string
      },
      minEstimatedDeliveryDate: Date,
      maxEstimatedDeliveryDate: Date,
      guaranteedDelivery: true
    }[],
  buyingOptions: string[],
  epid: number,
  itemAffiliateWebUrl: string
  itemWebUrl: string,
  itemLocation: {
    postalCode: string,
    country: string
  },
  additionalImages: [
    {
      imageUrl: string
    },
    {
      imageUrl: string
    },
    {
      imageUrl: string
    },
    {
      imageUrl: string
    }
  ],
  adultOnly: boolean,
  legacyItemId: number,
  availableCoupons: boolean,
  itemCreationDate: Date,
  topRatedBuyingExperience: boolean,
  priorityListing: boolean,
  listingMarketplaceId: string
  }