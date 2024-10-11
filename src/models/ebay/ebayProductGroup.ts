import ebayProduct from "./ebayProduct";


export default class ebayProductGroup {
    constructor(channelName: string, products: ebayProduct[] = []){
        this.channelName = channelName
        this.products = products
    }
    channelName: string;
    products: ebayProduct[]
}