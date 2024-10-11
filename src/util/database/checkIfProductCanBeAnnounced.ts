import { PrismaClient } from "@prisma/client";
import registerProductInDatabase from "./registerProductInDatabase";
import deleteProductInDatabase from "./deleteProductInDatabase";

const prisma = new PrismaClient();


export default async function checkIfProductCanBeAnnounced (productID: string, productCreationDate:Date) {

    //Do not really know why, but we gotta do it to avoid the error about engine not started or smt like that
    await prisma.$connect()

    const productInDatabase = await prisma.productsAnnouncedToday.findFirst({
        where: {
            product_id: productID
        }
    })


    //Remember that it is really important disconnect once a query has been finished
    //so we dont hit the connection pool limit
    prisma.$disconnect()

    if (!productInDatabase) {
        await registerProductInDatabase(productID, productCreationDate)
        return true;
    }

    return false;



}