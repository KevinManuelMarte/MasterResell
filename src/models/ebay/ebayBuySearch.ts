import ebayProduct from './ebayProduct'

export default interface ebayBuySearch {
    warnings: {
          errorId: number,
          domain: string,
          category: string,
          message: string
        }[],
      href: string,
      total: number,
      next: string,
      limit: number,
      offset: number,
      itemSummaries: ebayProduct[]
}
