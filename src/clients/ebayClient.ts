import eBayApi from "ebay-api";
import Config from "../models/config";
import ebayParams from "../models/ebay/ebayParams";
import productsFiltersGroup from "../models/productsFiltersGroup";
import ebayBuySearch from "../models/ebay/ebayBuySearch";
import ebayProduct from "../models/ebay/ebayProduct";
import { TextBasedChannel } from "discord.js";
import reportErrorInChannel from "../util/reportError";

//This whole code is toe export a function that gets all the products made within 24 hours that meets the filters in wallapop conditions json


const config: Config = require('../../config.json')

const ebayAPI = new eBayApi({
    appId: config.ebayAppID,
    certId: config.ebayCertID,
    sandbox: false,

    siteId: eBayApi.SiteId.EBAY_ES,
    marketplaceId: eBayApi.MarketplaceId.EBAY_ES,

    acceptLanguage: eBayApi.Locale.es_ES,
    contentLanguage: eBayApi.Locale.es_ES

})



export default class EbayClientClass {
    client: eBayApi = ebayAPI;

    //Getting minPrice and maxPrice params apart from ebayParams object is absolutely necessary because
    //Ebay API does not support GET requests with max and min price queries, so we gotta get max and min price of products from the
    //conditions file and filter the products found with the API request. Same with the date, we gotta filter it 
    async getProductsWithin24Hours(params: ebayParams, minPrice: number, maxPrice: number, channel: TextBasedChannel, negativeKeywords: string[]) {


        //The reason because of we make all of this in a promise is because of EBay API request rate limit. We gotta do it slow to make sure we dont hit it so soon
        //So we return resolve() after a timeout of 2 second.

        const products = await new Promise<ebayBuySearch> ((resolve, reject) => {
            setTimeout(async () => {
                const productsSearch = await this.client.buy.browse.search(params).catch(error => reportErrorInChannel(channel, error))
                resolve(productsSearch)
            }, 3000)
        })

        if (!products) return;

        if (products.itemSummaries.length > 90) products.itemSummaries.length = 90;
                const productsItems = products.itemSummaries.filter(
                    (product: ebayProduct) => {

                        //Some conditions IDs that the products should absolutely not have. Those refer to products that, for example, are being sold for parts, cus they are not working
                        //-----------------CONDITIONS MEANING--------------//
                        //7000: not working - for parts

                        const NotAllowedConditionsIDsProducts: number [] = [
                            7000,
                        ]

                        //Same as above, but with categories ids


                        //For more information about categories, please check EBay API call documentation or this: https://pages.ebay.com/sellerinformation/news/categorychanges/preview2023.html
                        //-----------------CATEGORIES MEANING--------------//
                        //43304: cellphone parts
                        //139973 - Videogames - Added because sometimes the api call would return a mix up of PS5 consoles and games for it, we only want the consoles.

                        const NotAllowedCategoryIds: number [] = [
                            43304,
                            139973
                        ]

                        const ProductConditionNotAllowedFound = NotAllowedConditionsIDsProducts.find((id) => product.conditionId == id) != undefined;
                        const ProductCategoryNotAllowedFound = product.categories.find((category) => {
                            return NotAllowedCategoryIds.find((id) => category.categoryId == id)
                        }) != undefined
                    
                    //Its not very important to get only the ebay products published today, since its not a reseller website like Wallapop
                    //and a there are just a few new products published everyday and a lots of products lasts days before being selled, so we can just get everything
                    //without worrying about the date. 

                    //EDIT: do not know if the client changes opinion in the future, but today he decided that he only wants the products published
                    //the day the bot is searching for products. So the code below is to make sure the product is not more than 1 day older

                    
                    const todayDateTime = new Date().getTime()
                    const productCreationTime = new Date(product.itemCreationDate).getTime()
                    const DifferenceInTime = Math.abs(todayDateTime - productCreationTime)
                    const DifferenceInDays = Math.floor(DifferenceInTime / (1000 * 24 * 24 * 60))

                    const ProductNotMoreThanOneDayOld = DifferenceInDays <= 1.2
                    const productPriceValue = product.price.value
                    const priceIsCorrect: boolean = productPriceValue > minPrice && productPriceValue < maxPrice

                    const productTitleHasNegativeKeywords: boolean = negativeKeywords.find(negativeKeyword => {
                        return product.title.toLowerCase().includes(negativeKeyword.toLowerCase())
                    }) != undefined

                    return priceIsCorrect && ProductCategoryNotAllowedFound == false && ProductConditionNotAllowedFound == false && productTitleHasNegativeKeywords == false && ProductNotMoreThanOneDayOld && product.itemLocation.country != 'US'
                }) as ebayProduct[]

        return productsItems



    }

    
}

export const ebayClient: EbayClientClass = new EbayClientClass()