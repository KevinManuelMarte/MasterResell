import { AxiosResponse } from "axios"
import wallapopProduct from "./wallapopProduct"

export default interface wallapopProductsSearch extends AxiosResponse {
    data: {
        search_objects: wallapopProduct[],
        from: number,
        to: number,
        distance_ordered: boolean,
        keywords: string | null,
        order: string,
        search_point: {
            latitude: number,
            longitude: number
        }
    }
}