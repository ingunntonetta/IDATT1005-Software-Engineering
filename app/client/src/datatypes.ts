// All the datatypes used in the frontend

export type User = {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    houseHold: {
        id: string;
        createdAt: string;
        name: string;
        joinCode: string;
    };
}

export type LoginUser = {
    username: string;
    password: string;
}

export type NewUser = {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    email: string;
}

export type Item = {
    id: number;
    name: string;
}

export type RecipeShortInfo = {
    id: number;
    title: string;
    description: string;
    difficulty: number;
    time: number;
    cost: number;
    imageUrl: string;
}

export type Recipe = {
    id: number;
    title: string;
    recipeText: string;
    difficulty: number;
    description: string;
    time: number;
    cost: number;
    imageUrl: string;
    ingredients: { amount: string; item: Item; }[];
    createdById?: string;
}

export type NewRecipe = {
    title: string;
    recipeText: string;
    difficulty: number;
    description: string;
    time: number;
    cost: number;
    imageUrl: string;
    ingredients: { amount: string; item: Item; }[];
}

export type ShoppingList = {
    archived: boolean;
    description: string;
    householdId: string;
    id: number;
    name: string;
    updatedAt: string | null;
    items?: ShoppingListItem[];
}

export type ShoppingListItem = {
    item: Item
    purchased: boolean
}

export type shoppingListReturnItem = {
    itemId: number;
    purchased: boolean;
    shoppingListId: number;
}

export type HouseholdMember = {
    firstName: string;
    lastName: string;
    avatarUrl: string;
}