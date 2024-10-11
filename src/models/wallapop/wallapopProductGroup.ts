
import wallapopProduct from "./wallapopProduct";

export default class wallapopProductGroup {
    constructor(channelName: string, products: wallapopProduct[] = []){
        this.channelName = channelName
        this.products = products
    }
    channelName: string;
    products: wallapopProduct[]
}