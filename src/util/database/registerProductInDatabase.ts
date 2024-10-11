import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


//This function checks for products in the database with the same ID as provided. If the date of the announcement of the product is the same as when this function is used
// or one day before it does nothing. But if the announcement was 3 days ago it deletes the data of that product
export default async function registerProductInDatabase (productID: string, productDateString: Date) {

    await prisma.$connect()

    await prisma.productsAnnouncedToday.create(
        {
            data: {
                product_id: productID,
                dateOfAnnouncement: productDateString.toString()
            }
        }
    )

    //Remember that it is really important to disconnect once the comprobation have been finished 
    //so we dont hit the connection pool limit
    prisma.$disconnect();


}