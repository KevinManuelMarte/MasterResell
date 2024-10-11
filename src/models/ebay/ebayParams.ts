import { timeFilterTypes } from "../wallapop/wallapopTimeFilterTypes";



export default class EbayParams {
    
    constructor
        (
        productKeywords: string,
        categoryIDs: string,


        )

        { 
        this.q = productKeywords
        this.limit = "200" //The maximum is 200
        this.categoryID = categoryIDs

     }
     public limit?: string;
     public q: string;
     public categoryID: string
    }