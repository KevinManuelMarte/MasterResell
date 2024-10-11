export default interface productGroup {
    products_channel_name: string;
    productsFilters: {
        keywords: string;
        minPrice: number;
        maxPrice: number;
    }[]
}