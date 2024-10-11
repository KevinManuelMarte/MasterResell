
import EbayParams from "../models/ebay/ebayParams";
import { ebayClient } from "../clients/ebayClient";
import ebayProduct from "../models/ebay/ebayProduct";
import ebayProductGroup from "../models/ebay/ebayProductGroup";
import productFilter from "../models/productFilters";
import checkIfProductCanBeAnnounced from "./database/checkIfProductCanBeAnnounced";
import productsFiltersGroup from "../models/productsFiltersGroup";
import { TextBasedChannel, TextBasedChannelMixin } from "discord.js";

const productFilters_Iphone: productsFiltersGroup = require("../conditions/ebay/ebay_product_filters_iphone.json")
const productFilters_Samsung: productsFiltersGroup = require("../conditions/ebay/ebay_product_filters_samsung.json")
const productFilters_PS: productsFiltersGroup = require("../conditions/ebay/ebay_product_filters_ps.json")
const productFilters_PC_Hardware: productsFiltersGroup = require("../conditions/ebay/ebay_product_filters_pc_hardware.json")
const productFilters_Apple_Watch: productsFiltersGroup = require("../conditions/ebay/ebay_product_filters_apple_watch.json")
const productFilters_Switch: productsFiltersGroup = require("../conditions/ebay/ebay_product_filters_switch.json")
//This whole code is toe export a function that gets all the products made within 24 hours that meets the filters in wallapop conditions json
//and put them all in an array. After that the array is used by the bot to send embeds announcing all the products found

const ebayAllProductsFiltersGroup: productsFiltersGroup[] = [];

ebayAllProductsFiltersGroup.push(productFilters_Iphone)
ebayAllProductsFiltersGroup.push(productFilters_Samsung)
ebayAllProductsFiltersGroup.push(productFilters_PS)
ebayAllProductsFiltersGroup.push(productFilters_PC_Hardware)
ebayAllProductsFiltersGroup.push(productFilters_Switch)
ebayAllProductsFiltersGroup.push(productFilters_Apple_Watch)


const productsArray: ebayProductGroup [] = []
//Function that uses the Wallapop client to search for the product indicated with the filters and returns an array with found ones
async function getEbayProductSearch (filters: productFilter, categoryIDs: string, objectTypesIDs: string, errorsChannel: TextBasedChannel, negativeKeywords: string[]) {
    
    const params: EbayParams = new EbayParams(filters.keywords, categoryIDs);
    const productsFound: ebayProduct[] | undefined = await ebayClient.getProductsWithin24Hours(params, filters.minPrice, filters.maxPrice, errorsChannel, negativeKeywords);
    return productsFound;
}

async function createGroupsFromFilters (filters: productFilter, productChannelName: string, categoryIDs: string, objectTypesIDs: string, errosChannel: TextBasedChannel, negativeKeywords: string[]) {

    

    const productsFound = await getEbayProductSearch(filters, categoryIDs, objectTypesIDs, errosChannel, negativeKeywords)

    
    if (!productsFound) {
        return;
    }

    const productsFilteredByTitle = productsFound?.filter((ebayProduct) => {
        //Remember that its always necessary to lower case the title and the keywords. The reason behind this is that
        //for example is we have the keyword 'Iphone X' and the product title is 'IPHONE X' the nameIsCorrect comprobation
        //will result false just becayse of uppercase and lowercase letters.


        const productKeywords: string[] = filters.keywords.normalize().toLowerCase().split('-')
        const productTitle: string = ebayProduct.title.normalize().toLowerCase()
        return productTitle.includes(productKeywords[0])
    });


    const productGroup: ebayProductGroup = new ebayProductGroup(productChannelName);
    const productGroupInArray = productsArray.find((arrayProductGroup) => {
        return arrayProductGroup.channelName == productGroup.channelName;
    })




    return new Promise<void>(async (resolve, reject) => {
        
        

    if (!productGroupInArray) {
        productsArray.push(productGroup)

        const productsPushed: Promise<void> [] = []

        productsFilteredByTitle.forEach(async (ebayProduct: ebayProduct) => {
            productsPushed.push(new Promise(async (resolve, reject) => {
                //Its not really necessary to check if the product is already added into the group, since these will be the first products to be added
                //but its recommended to check anyways just in case
                const productInGroupAlready = productGroup.products.find((product)=> {
                    return ebayProduct.itemId == product.itemId
                })
                    
                if (productInGroupAlready) return resolve();

                const productCreationDate: Date = new Date(ebayProduct.itemCreationDate)

                const canBeAnnounced = await checkIfProductCanBeAnnounced(ebayProduct.itemId,  productCreationDate)
                if (canBeAnnounced == true) {
                    productGroup.products.push(ebayProduct)
                    resolve()
                } else{
                    resolve()
                }
            }))
        }
    )

    Promise.all(productsPushed).then(() => resolve())
    }
    if (productGroupInArray) {
        const productsPushed: Promise<void> [] = []
        productsFilteredByTitle.forEach(async (ebayProduct: ebayProduct) => {

            productsPushed.push(new Promise(async (resolve, reject) => {

                //We gotta check if the product is already in the group. Since the filters usually have similar values with other filters group it can happen that we add 
                //a product twice without wanting to, so we check if the product is already added, if not, we just resolve without doing anything.
                const productInGroupAlready = productGroupInArray.products.find((product)=> {
                    return ebayProduct.itemId == product.itemId
                })

                if (productInGroupAlready) return resolve();

                const productCreationDate: Date = new Date(ebayProduct.itemCreationDate)


                const canBeAnnounced = await checkIfProductCanBeAnnounced(ebayProduct.itemId, productCreationDate)
                if (canBeAnnounced == true) {
                    productGroup.products.push(ebayProduct)
                    resolve()
                } else {
                    resolve()
                }
            }))
        }
    )
    Promise.allSettled(productsPushed).then(() => resolve())
    }
    })


}


export default async function getEbayProducts(errorsChannel: TextBasedChannel){
    //First we gotta make sure that the array that will be returned from the function is completely empty
    //before starting to add products to it
    productsArray.length = 0;


    const addingProductsPromises: Promise<void> [] = []


    for (const ebayProductFilterGroup of ebayAllProductsFiltersGroup) {
        for (const product of ebayProductFilterGroup.groups) {
            for (const productFilters of product.filters) {
                addingProductsPromises.push(createGroupsFromFilters(productFilters, product.product_channel_name, ebayProductFilterGroup.category_ids, ebayProductFilterGroup.object_type_ids, errorsChannel, product.general_negative_keywords))
            }
        }
    }

    return Promise.allSettled(addingProductsPromises).then(() => productsArray);
                



}