export default interface singleProductFilters {
    product_channel_name: string;
    general_negative_keywords: string[];
    filters: {
        keywords: string;
        minPrice: number;
        maxPrice: number;
    }[]
}