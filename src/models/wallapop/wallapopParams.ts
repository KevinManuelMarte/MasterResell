import { timeFilterTypes } from "./wallapopTimeFilterTypes";



export default class WallapopParams {
    
    constructor
        (
        productKeywords: string, 
        productMinPrice: number, 
        productMaxPrice: number, 
        categoryIDs: string,
        objectTypeIds: string,
        timeFilter2: string = timeFilterTypes.last24Hours, 
        longitude2: number = -3.69196, 
        latitude2:number = 40.41956,
        filtersSource: string = "default_filters",
        )

        { 
        this.keywords = productKeywords
        this.min_sale_price = productMinPrice
        this.max_sale_price = productMaxPrice
        this.time_filter = timeFilter2
        this.longitude = longitude2;
        this.latitude = latitude2;
        this.filters_source = filtersSource
        this.category_ids = categoryIDs
        this.object_type_ids = objectTypeIds
     }
    public keywords: string;
    public min_sale_price: number;
    public max_sale_price: number;
    public time_filter: string;
    public longitude:number;
    public latitude:number;
    public filters_source: string;
    public category_ids: string;
    public object_type_ids: string;
}