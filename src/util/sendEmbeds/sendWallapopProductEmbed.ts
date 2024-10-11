import { EmbedBuilder } from "discord.js";
import wallapopProduct from "../../models/wallapop/wallapopProduct";

function transformBooleanToString (bool: boolean) {
    if (bool == true) {
        return 'Si'
    }
    else{
        return 'No'
    }
}

export default function wallapopProductEmbed(product: wallapopProduct) {
    let shippingAvailable: string;
    let shippingFree: string;
    let productCreationDate = product.creation_date.toString().split('T')[0]

    if (product.supports_shipping == true) {
        shippingAvailable = 'Si'
    } 
    else{ 
        shippingAvailable = 'No'
    }


    return new EmbedBuilder()
    .setColor('Aqua')
    .setTitle(product.title)
    .setDescription(product.description)
    .setThumbnail(product.images[0].original)
    .setFields(
        {name: "Precio", value: `${product.price} EUR`},
        {name: "Link", value: `https://es.wallapop.com/item/${product.web_slug}`},
        {name: "Fecha", value: productCreationDate},
        {name: "Envio disponible", value: shippingAvailable},
        {name: 'Renovado', value: transformBooleanToString(product.is_refurbished)},
        {name: 'Tienda', value: 'Wallapop'}
    )
}