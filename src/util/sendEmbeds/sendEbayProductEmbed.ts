import { EmbedBuilder } from "discord.js";
import wallapopProduct from "../../models/wallapop/wallapopProduct";
import ebayProduct from "../../models/ebay/ebayProduct";

function transformBooleanToString (bool: boolean) {
    if (bool == true) {
        return 'Si'
    }
    else{
        return 'No'
    }
}


//We need the product condition to be in spanish. But some products come with it in english or other languages. So we gotta create a function
//that translates the condition to spanish

function translateProductConditionToSpanish (conditionID: number) {
    //Ebay products conditions have IDs, for example, the id for 'Good - Refurbished' is 2030.
    //so, all we gotta do is check the ID and return a value in spanish. Thats all.

    //ATTENTION: there are conditions ids that refer to products that do not work, that are being sold for parts. Those should not be announced
    //and they are prevented. But they are translated as well here. Keep in mind that



    //IMPORTANT: conditionID MUST be converted to string before proceeding to comparisons.
    //for some damn reason the parameter is converted to string automatically, i dont know why, but i guess
    //we gotta do the comparison this way.
    switch (conditionID.toString()) {
        case "7000": 
            return 'No funciona - piezas';
        case "3000": 
            return 'Usado';
        case "2500":
            return 'Reacondicionado por el vendedor';
        case "2030":
            return 'Bueno - Renovado' ;
        case "2020":
            return 'Muy bueno - Renovado';
        case "2010":
            return 'Excelente - Renovado';
        case "1500":
            return 'Abierto - Sin usar';
        case "1000":
            return 'Nuevo';
        default: 
            return "Desconocido";
    }

}



//Some conditions IDs that the products should absolutely not have. Those refer to products that, for example, are being sold for parts, cus they are not working
//-----------------CONDITIONS MEANING--------------//
//7000: not working - for parts
//139973 - Videogames - Added because sometimes the api call would return a mix up of PS5 consoles and games for it, we only want the consoles.


const NotAllowedConditionsIDsProducts: number [] = [
    7000,
    139973
]



//Same as above, but with categories ids
//-----------------CATEGORIES MEANING--------------//
//43304: parts

//For more information about categories, please check EBay API call documentation or this: https://pages.ebay.com/sellerinformation/news/categorychanges/preview2023.html
const NotAllowedCategoryIds: number [] = [
    43304
]

//Keep in mind that the products with not allowed categoryIds or conditionsids should be checked before adding them to the array waaay before being here. But
//it does no harm to check again just in case

export default function ebayProductEmbed(product: ebayProduct) {
    const productCondition: string = translateProductConditionToSpanish(product.conditionId)
    const ProductConditionNotAllowedFound = NotAllowedConditionsIDsProducts.find((id) => product.conditionId == id) != undefined;
    const ProductCategoryNotAllowedFound = product.categories.find((category) => {
        const productInNotAllowedCategory = NotAllowedCategoryIds.find((id) => category.categoryId == id)
        return category.categoryId == productInNotAllowedCategory
    }) != undefined

    if (ProductCategoryNotAllowedFound == true) return;
    if (ProductConditionNotAllowedFound == true) return;

    let productCreationDate = product.itemCreationDate.toString().split('T')[0]


    return new EmbedBuilder()
    .setColor('Aqua')
    .setTitle(product.title)
    .setThumbnail(product.image.imageUrl)
    .setFields(
        {name: "Precio", value: `${product.price.value} EUR`},
        {name: "Link", value: product.itemWebUrl},
        {name: "Fecha", value: productCreationDate},
        {name: "Envio disponible", value: 'Si'},
        {name: 'Condición', value: productCondition},
        {name: 'Tienda', value: 'Ebay'}
    )
}