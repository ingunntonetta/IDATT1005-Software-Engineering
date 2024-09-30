import { Prisma } from "@prisma/client";

class User {
    info = Prisma.validator<Prisma.UserDefaultArgs>()({
        select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            houseHold: true
        }
    });

    authLocal = Prisma.validator<Prisma.UserDefaultArgs>()({
        select: {
            id: true,
            passwordHash: true,
            salt: true
        }
    });

    househouldMemberInfo = Prisma.validator<Prisma.UserDefaultArgs>()({
        select: {
            firstName: true,
            lastName: true,
            avatarUrl: true
        }
    });

    oauthInfo = Prisma.validator<Prisma.UserDefaultArgs>()({
        select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            houseHold: true,
            oauthUser: {
                select: {
                    oauth_id: true,
                    provider: true
                }
            }
        }
    });
}

class ShoppingList {
    shortInfo = Prisma.validator<Prisma.ShoppingListDefaultArgs>()({
        select: {
            id: true,
            updatedAt: true,
            name: true,
            description: true,
            archived: true,
            householdId: true
        }
    });

    fullInfo = Prisma.validator<Prisma.ShoppingListDefaultArgs>()({
        select: {
            id: true,
            updatedAt: true,
            name: true,
            description: true,
            archived: true,
            householdId: true,
            items: {
                select: {
                    purchased: true,
                    item: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            }
        }
    });
}

class Recipes {
    shortInfo = Prisma.validator<Prisma.RecipeDefaultArgs>()({
        select: {
            id: true,
            title: true,
            difficulty: true,
            time: true,
            cost: true,
            createdById: true,
            imageUrl: true,
            description: true
        }
    });

    fullInfo = Prisma.validator<Prisma.RecipeDefaultArgs>()({
        select: {
            id: true,
            title: true,
            difficulty: true,
            time: true,
            cost: true,
            createdById: true,
            imageUrl: true,
            description: true,
            recipeText: true,
            ingredients: {
                select: {
                    amount: true,
                    item: {
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            }
        }
    });
}

const user = new User();
const recipes = new Recipes();
const shoppingList = new ShoppingList();

export type UserInfo = Prisma.UserGetPayload<typeof user.info>;
export type UserAuthLocal = Prisma.UserGetPayload<typeof user.authLocal>;

export default { user, shoppingList, recipes };