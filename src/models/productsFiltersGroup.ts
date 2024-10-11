import singleProductFilters from "./singleProductFilters";

export default interface productsFiltersGroup {
    category_ids: string;
    object_type_ids: string;
    groups: singleProductFilters[]
}