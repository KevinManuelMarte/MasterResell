import { Client, Events, GatewayIntentBits, Guild, GuildBasedChannel, GuildChannel, Interaction, TextBasedChannel, TextChannel } from "discord.js";

import getWallapopProducts from "./util/getWallapopProducts";
import wallapopProductGroup from "./models/wallapop/wallapopProductGroup";
import wallapopProduct from "./models/wallapop/wallapopProduct";
import wallapopProductEmbed from "./util/sendEmbeds/sendWallapopProductEmbed";
import ebayProduct from "./models/ebay/ebayProduct";
import ebayProductEmbed from "./util/sendEmbeds/sendEbayProductEmbed";
import getEbayProducts from "./util/getEbayProducts";
import ebayProductGroup from "./models/ebay/ebayProductGroup";
import { ebayClient } from "./clients/ebayClient";
import  Config  from "./models/config";
import reportErrorInChannel from "./util/reportError";
import EbayParams from "./models/ebay/ebayParams";
const config: Config = require('../config.json')


const client: Client = new Client({intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds
]})


client.login(config.TOKEN)


async function wallapopAnnounceAllProducts (wallapopProductsGroups: wallapopProductGroup[],  guild: Guild) {
    wallapopProductsGroups.forEach((productGroup) => {
        const channel = guild.channels.cache.find((channel) => channel.name === productGroup.channelName) 

        productGroup.products.forEach((product) => wallapopAnnounceProduct(product, channel))
    })
}

async function ebayAnnounceAllProducts (ebayProductsGroups: ebayProductGroup[],  guild: Guild) {
    ebayProductsGroups.forEach((productGroup) => {
        const channel = guild.channels.cache.find((channel) => channel.name === productGroup.channelName) 

        productGroup.products.forEach((product) => ebayAnnounceProduct(product, channel))
    })
}


async function wallapopAnnounceProduct (product: wallapopProduct, channel: GuildBasedChannel | undefined) {
    if (!channel?.isTextBased() || undefined)  {
        return;

    }

    const embed = wallapopProductEmbed(product)

    if (!embed) return;


    channel.send({content: '', embeds: [embed]})
}

async function ebayAnnounceProduct (product: ebayProduct, channel: GuildBasedChannel | undefined) {

    //Ebay products might contain no images, so we gotta transform it to "" before trying to announce if ebay product has no image.
    if (!product.image.imageUrl) product.image.imageUrl = ""
    
    if (!channel?.isTextBased() || undefined) return;
    const embed = ebayProductEmbed(product)

    if (!embed) return;
    channel.send({content: '', embeds: [embed]})
}


client.on('ready', async ()=> {
    const guild = await client.guilds.fetch('1200023406884704286')
    const logsChannel = await guild.channels.fetch(config.errorMessagesChannelID) as TextBasedChannel
    logsChannel.send('Bot prendido')
    console.log(`Logged in as ${client.user?.tag}`)

    
    setInterval(async () => {

        logsChannel.send('Empezada la busqueda de productos...')

        //Unlike EBay, Wallapop API does not have a requests limit, so we can do the search of products any moment we want to.
        const wallapopProducts: wallapopProductGroup [] = await getWallapopProducts(logsChannel).catch(error => reportErrorInChannel(logsChannel, error) ) as unknown as wallapopProductGroup[]

        if (wallapopProducts) {
            wallapopAnnounceAllProducts(wallapopProducts, guild)
            logsChannel.send('Busqueda de productos de Wallapop terminada. Productos enviados: ')

            //If we send the array of products returned in the logs channel it will be easier to debug errors later
            logsChannel.send('```' + wallapopProducts + '```')

            //Good for debugging printing in console the products too
            console.log(wallapopProducts)
        }

        
        //Before doing the search of requests in EBay API we gotta make sure we have not yet hit the limit of requests per day, so we do not waste any time on searching for products
        //and generating unnnecesary logs.
        
        //So we make a test request first. If the limit is hit we are just gonna return and send a log message in the logs channel

        //The params have to be logical things, because if not we might get some errors.
        //the ones used correspond to the Iphone X
        const testRequestParams = new EbayParams('Iphone X', '9355')

        //If the request is succesfull,  we gonna get an array, if the request was not succesfull we gonna get an undefined object.
        const ebayRequestTest: ebayProduct[] | undefined = await ebayClient.getProductsWithin24Hours(testRequestParams, 10, 9999, logsChannel, [])


    
        if (!ebayRequestTest) { 
            logsChannel.send('Limite de ebay alcanzado. No se anunciaran products de Ebay.')
            console.log('Limite de Ebay alcanzado.')
            return;
        }
            
        const ebayProducts: ebayProductGroup [] = await getEbayProducts(logsChannel).catch(error => reportErrorInChannel(logsChannel, error)) as unknown as ebayProductGroup[]

        if (ebayProducts) {
            ebayAnnounceAllProducts(ebayProducts, guild)
            logsChannel.send('Busqueda de productos de Ebay terminada. Productos enviados: ')

            logsChannel.send('```' + ebayProducts + '```')

            console.log(ebayProducts)
        }
    
        
        
    }, 2700000) //Bot will check products for announce by the amount specified here. Edit if you want (miliseconds)
    

    
  
    
    }
)


