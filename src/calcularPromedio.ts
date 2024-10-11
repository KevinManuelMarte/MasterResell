import { WallapopClient } from "./clients/wallapopClient";
import productsFiltersGroup from "./models/productsFiltersGroup";
import WallapopParams from "./models/wallapop/wallapopParams";
import { PartialTextBasedChannel, TextBasedChannel } from "discord.js";
import wallapopProductGroup from "./models/wallapop/wallapopProductGroup";

//-----------------IMPORTANT----------------//
//This whole code is to calculate the average price of each product. Not anymore. Safe to delete if wanted, but not recommended.

const productFilters_Iphone: productsFiltersGroup = require("./conditions/wallapop/wallapop_product_filters_iphone.json")
const productFilters_Samsung: productsFiltersGroup = require("./conditions/wallapop/wallapop_product_filters_samsung.json")
const productFilters_PS: productsFiltersGroup = require("./conditions/wallapop/wallapop_product_filters_ps.json")
const productFilters_PC_Hardware: productsFiltersGroup = require("./conditions/wallapop/wallapop_product_filters_pc_hardware.json")
const productFilters_Apple_Watch: productsFiltersGroup = require("./conditions/wallapop/wallapop_product_filters_apple_watch.json")
const productFilters_Switch: productsFiltersGroup = require("./conditions/wallapop/wallapop_product_filters_switch.json")
//This whole code is toe export a function that gets all the products made within 24 hours that meets the filters in wallapop conditions json
//and put them all in an array. After that the array is used by the bot to send embeds announcing all the products found

const wallapopAllProductsFiltersGroups: productsFiltersGroup[] = [];

// wallapopAllProductsFiltersGroups.push(productFilters_Iphone)
// wallapopAllProductsFiltersGroups.push(productFilters_Samsung)
// wallapopAllProductsFiltersGroups.push(productFilters_PS)
// wallapopAllProductsFiltersGroups.push(productFilters_Apple_Watch)
wallapopAllProductsFiltersGroups.push(productFilters_Switch)

wallapopAllProductsFiltersGroups.forEach(async function(productFilterGroup: productsFiltersGroup) {
    productFilterGroup.groups.forEach(async (singleProductFilter) => {

        singleProductFilter.filters.forEach(async (filters) => {
            const params = new WallapopParams(filters.keywords, filters.minPrice, filters.maxPrice, productFilterGroup.category_ids, productFilterGroup.object_type_ids)

            const nulo = null
            const wallapopProductsSearch = await WallapopClient.getProductsWithin24Hours(params, null as unknown as TextBasedChannel)
            const productsSeparationsGroup: wallapopProductGroup[] = []
            let priceAmount = 0
            let numberOfProducts = 0

            if (wallapopProductsSearch) {
                wallapopProductsSearch.forEach(async (product) => {
                    numberOfProducts++
                    priceAmount = priceAmount + product.price

                })
            }

            console.log(`El precio promedio de un ${filters.keywords} es ${priceAmount / numberOfProducts}`)
        })
    })
})