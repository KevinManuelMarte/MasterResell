export default interface wallapopProduct   {
    id: string
    title: string
    description: string
    distance: number
    images: {
      original: string,
      xsmall: string,
      small: string,
      large: string,
      medium: string,
      xlarge: string,
      original_width: number,
      original_height: number
  }[]
    user: {
      micro_name: string
      id: string
      image:  {
        original: string,
        xsmall: string,
        small: string,
        large: string,
        medium: string,
        xlarge: string,
        original_width: number,
        original_height: number
    }[],
      online: boolean
      kind: string
    }
    flags: {
      pending: boolean
      sold: boolean
      reserved: boolean
      banned: boolean
      expired: boolean
      onhold: boolean
    }
    visibility_flags: {
      bumped: boolean
      highlighted: boolean
      urgent: boolean
      country_bumped: boolean
      boosted: boolean
    }
    price: number
    currency: string
    free_shipping: boolean
    web_slug: string
    category_id: number
    shipping: {
      item_is_shippable: boolean
      user_allows_shipping: boolean
      cost_configuration_id: any
    }
    supports_shipping: boolean
    shipping_allowed: boolean
    seller_id: string
    favorited: boolean
    creation_date: Date
    modification_date: Date
    location: {
      postal_code: string
      country_code: string
      city: string
    }
    type_attributes: {}
    taxonomy: any
    discount: any
    is_refurbished: boolean
  }