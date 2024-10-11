import { WallapopClient } from "../clients/wallapopClient";
import WallapopParams from "../models/wallapop/wallapopParams";

import wallapopProduct from "../models/wallapop/wallapopProduct";
import wallapopProductGroup from "../models/wallapop/wallapopProductGroup";
import productFilter from "../models/productFilters";


import checkIfProductCanBeAnnounced from "./database/checkIfProductCanBeAnnounced";
import productsFiltersGroup from "../models/productsFiltersGroup";
import { TextBasedChannel } from "discord.js";
import reportErrorInChannel from "./reportError";

const productFilters_Iphone: productsFiltersGroup = require("../conditions/wallapop/wallapop_product_filters_iphone.json")
const productFilters_Samsung: productsFiltersGroup = require("../conditions/wallapop/wallapop_product_filters_samsung.json")
const productFilters_PS: productsFiltersGroup = require("../conditions/wallapop/wallapop_product_filters_ps.json")
const productFilters_PC_Hardware: productsFiltersGroup = require("../conditions/wallapop/wallapop_product_filters_pc_hardware.json")
const productFilters_Apple_Watch: productsFiltersGroup = require("../conditions/wallapop/wallapop_product_filters_apple_watch.json")
const productFilters_Switch: productsFiltersGroup = require("../conditions/wallapop/wallapop_product_filters_switch.json")

const wallapopAllProductsFiltersGroups: productsFiltersGroup[] = [];

wallapopAllProductsFiltersGroups.push(productFilters_Iphone)
wallapopAllProductsFiltersGroups.push(productFilters_Samsung)
wallapopAllProductsFiltersGroups.push(productFilters_PS)
wallapopAllProductsFiltersGroups.push(productFilters_PC_Hardware)
wallapopAllProductsFiltersGroups.push(productFilters_Switch)
wallapopAllProductsFiltersGroups.push(productFilters_Apple_Watch)


const productsArray: wallapopProductGroup [] = []

async function getWallapopProductSearch (filters: productFilter, categoryIDs: string, objectTypesIDs: string, errorsChannel: TextBasedChannel, negativeKeywords: String[]) {
    
    const params: WallapopParams = new WallapopParams(filters.keywords, filters.minPrice, filters.maxPrice, categoryIDs, objectTypesIDs);
    const productsFound: wallapopProduct[] | undefined = await WallapopClient.getProductsWithin24Hours(params, errorsChannel, negativeKeywords);
    return productsFound;
}

async function createGroupsFromFilters (filters: productFilter, productChannelName: string, categoryIDs: string, objectTypesIDs: string, errorsChannel: TextBasedChannel, negativeKeywords: String[]) {
    const productsFound = await getWallapopProductSearch(filters, categoryIDs, objectTypesIDs, errorsChannel, negativeKeywords)

    if (!productsFound) return 

    const productsFilteredByTitle = productsFound?.filter((wallapopProduct) => {

        const productName: string[] = filters.keywords.normalize().toLowerCase().split('-')
        const productTitle = wallapopProduct.title.normalize().toLowerCase()


        return productTitle.includes(productName[0])
    });

    
    
    const productGroup: wallapopProductGroup = new wallapopProductGroup(productChannelName);
    const productGroupInArray = productsArray.find((arrayProductGroup) => {
        return arrayProductGroup.channelName == productGroup.channelName;
    })

    return new Promise<void> (async (resolve, reject) => {
    
    
        if (!productGroupInArray) {
            productsArray.push(productGroup)

            const productsPushed: Promise<void> [] = []

            productsFilteredByTitle.forEach(async (wallapopProduct: wallapopProduct) => {
                
                productsPushed.push(new Promise(async (resolve, reject) => {
                    //Its not really necessary to check if the product is already added into the group, since these will be the first products to be added
                    //but its recommended to check anyways just in case
                    const productInGroupAlready = productGroup.products.find((product)=> {
                        return wallapopProduct.id == product.id
                    })
                    
                    if (productInGroupAlready) return resolve();


                    const todayDate = new Date()
                    const productLastModificationDate: Date = new Date(wallapopProduct.creation_date)

                    const differenceInDays = Math.floor(Math.abs(todayDate.getTime() - productLastModificationDate.getTime()) / (1000 * 60 * 60 * 24))

                    if (differenceInDays > 1) return resolve()
                    const canAnnounce = await checkIfProductCanBeAnnounced(wallapopProduct.id, productLastModificationDate)
                    if (canAnnounce == true) {
                        productGroup.products.push( wallapopProduct)
                        resolve()
                    } else {
                        resolve()
                    }
                }))
    
            }
        )
        Promise.allSettled(productsPushed).then(()=> resolve())
        }
        if (productGroupInArray) {
    
            const productsPushed: Promise<void> [] = []

            productsFilteredByTitle.forEach((wallapopProduct: wallapopProduct) => {

                productsPushed.push(new Promise(async (resolve, reject) => {

                //We gotta check if the product is already in the group. Since the filters usually have similar values with other filters group it can happen that we add 
                //a product twice without wanting to, so we check if the product is already added, if not, we just resolve without doing anything.
                const productInGroupAlready = productGroupInArray.products.find((product)=> {
                    return wallapopProduct.id == product.id
                })

                if (productInGroupAlready) return resolve();

                    const todayDate = new Date()

                    //We get the last modification date instead of the creation date because 
                    //there are some products that get modified and become available after a long time after made
                    //so if we get the creation date we would be ignoring some perfectly fine products to announce
                    const productLastModificationDate: Date = new Date(wallapopProduct.modification_date)

                    const differenceInDays = Math.floor(Math.abs(todayDate.getTime() - productLastModificationDate.getTime()) / (1000 * 60 * 60 * 24))

                    //The reason behind checking the products is not more of two days old is because since Wallapop is an active reselling platform 
                    //a lot of products get sold very soon. Considering the default time param for the wallapop products search it should only get today's published
                    //products. But anyways we do a check just in case
                    if (differenceInDays > 2) return resolve()
                    const canAnnounce = await checkIfProductCanBeAnnounced(wallapopProduct.id, productLastModificationDate).catch((error) => reportErrorInChannel(errorsChannel, error))
                    if (canAnnounce == true) {
                        productGroup.products.push( wallapopProduct)
    
                        resolve()
                    } 
                    else {
                        resolve()
                    }
                }))
            }
        )

        Promise.allSettled(productsPushed).then(()=> resolve()).catch(error => console.log(error))
        }


    
    })

}


export default async function getWallapopProducts(errorsChannel: TextBasedChannel){

    //First we gotta make sure that the array that will be returned from the function is completely empty
    //before starting to add products to it
    productsArray.length = 0;

    const addingProductsPromises: Promise<void> [] = []


    for (const wallapopProductFilterGroup of wallapopAllProductsFiltersGroups) {
        for (const product of wallapopProductFilterGroup.groups) {
            for (const productFilters of product.filters) {

                addingProductsPromises.push(createGroupsFromFilters(productFilters, product.product_channel_name, wallapopProductFilterGroup.category_ids, wallapopProductFilterGroup.object_type_ids, errorsChannel, product.general_negative_keywords))
            }
        }
    }

    return Promise.all(addingProductsPromises).then(() => productsArray).catch(error => console.log(error))
                



}