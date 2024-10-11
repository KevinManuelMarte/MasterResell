import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


//This function is no longer used anyways, just kept here just if someone in the future wants to use it
export default async function deleteProductInDatabase (productID: string) {

    const productInDatabase = await prisma.productsAnnouncedToday.findFirst({
        where: {
            product_id: productID
        }
    })

    if (!productInDatabase) return;

    await prisma.productsAnnouncedToday.delete(
        {
            where: {
                id: productInDatabase?.id
            }
        }
    )

    prisma.$disconnect();

}