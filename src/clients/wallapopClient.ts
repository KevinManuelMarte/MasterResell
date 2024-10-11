import axios, { Axios, AxiosResponse } from 'axios';
const config: Config = require('../../config.json')
import WallapopParamsModel from "../models/wallapop/wallapopParams";

import wallapopProduct from '../models/wallapop/wallapopProduct';
import { TextBasedChannel } from 'discord.js';
import reportErrorInChannel from '../util/reportError';
import wallapopProductGroup from '../models/wallapop/wallapopProductGroup';
import wallapopProductsSearch from '../models/wallapop/wallapopProductsSearch';
import Config from '../models/config';

class WallapopClientClass {
    protected APIurl: string = config.wallapopAPI
    protected axiosClient: Axios = axios.create()

    async getProductsWithin24Hours(productParams: WallapopParamsModel, channel: TextBasedChannel, negativeKeywords: String[]) {
        const searchProducts: wallapopProductsSearch = await this.axiosClient.get(this.APIurl, { params: productParams}).then(response => response).catch(error => {
            reportErrorInChannel(channel, error) ;
        }) as wallapopProductsSearch

        if (searchProducts) {
            const products: wallapopProduct[] = searchProducts.data.search_objects.filter(product => {
                const productTitleHasNegativeKeywords = negativeKeywords.find(keyword => {
                    return product.title.toLowerCase().includes(keyword.toLowerCase())
                }) != undefined
                return productTitleHasNegativeKeywords == false
            }) 
    
            if (products.length > 16) products.length = 16;
    
            return products
        }
    }
}

export const WallapopClient: WallapopClientClass = new WallapopClientClass();
