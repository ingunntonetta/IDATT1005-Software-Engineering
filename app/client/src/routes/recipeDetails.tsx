import { BackPageHeader } from "@/components/back-page-header";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Recipe } from "@/datatypes";
import fridgeService from "@/services/fridge";
import recipeService from "@/services/recipes";
import userService from "@/services/user";
import * as React from "react";
import { useNavigate, useParams } from "react-router";

const RecipeDetails: React.FC = () => {
    const { toast } = useToast();
    const { id } = useParams();
    const navigate = useNavigate();
    const [recipe, setRecipe] = React.useState<Recipe>({} as Recipe);
    const [userId, setUserId] = React.useState<string>();
    const [isCreator, setIsCreator] = React.useState<boolean>(false);

    // Gets user info and recipe info
    React.useEffect(() => {
        userService.getMe().then((response) => {
            setUserId(response.id);
        })

        recipeService.get(id as string)
            .then((response) => {
                setRecipe(response.data)
            })
            .catch((error) => console.error(error));
    }, [id]);

    // Check if the user is the author of the recipe (to show delete button)
    React.useEffect(() => {
        setIsCreator(userId === recipe.createdById);
    }, [userId, recipe.createdById])

    // Handler for deleting all the recipe's ingredients from the fridge
    const handleDeleteFridgeItems = () => {
        fridgeService.remove(recipe.ingredients.map((ingredient) => ingredient.item.id))
            .then(() => {
                toast({
                    title: "Ingredients removed from fridge",
                    duration: 1500,

                });
                navigate("/fridge");
            })
            .catch((error) => console.error(error));
    }

    // Handler for creating a shopping list from the recipe
    const handleCreateList = () => {
        recipeService.createShoppingList(recipe.id)
            .then((response) => {
                toast({
                    title: "Shopping list created",
                    duration: 1500,
                });
                navigate(`/shopping-lists/${response.data.id}`);
            })
            .catch((error) => console.error(error));
    }

    // Handler for deleting the recipe
    const handleDeleteRecipe = () => {
        recipeService.delete(recipe.id)
            .then((response) => {
                toast({
                    title: "Recipe deleted",
                    duration: 1500,

                });
                navigate(response.redirect);
            })
            .catch((error) => console.error(error));
    }

    return (
        <div className="flex items-center flex-col w-full p-4">
            <div className="flex items-center w-full">
                <BackPageHeader title="Recipes" redirect="/recipes" />
            </div>

            <Card className="mt-8 w-full">
                <CardHeader>
                    <div className="flex justify-between items-center space-x-2 mb-3">
                        <CardTitle>{recipe.title}</CardTitle>
                        {/* Delete button if the user is the author */}
                        {
                            isCreator &&
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive">Delete</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure? </AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently delete the recipe</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteRecipe}>Confirm</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        }
                    </div>
                    <Separator />
                </CardHeader>

                {/* Show info about the recipe */}
                <CardContent className="flex flex-col gap-2">
                    <div>
                        {recipe.imageUrl ? <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-64 object-cover rounded-md" />
                            : <Skeleton className="h-64 w-full mt-4 rounded-md" />}
                    </div>

                    <div>
                        {recipe.description}
                    </div>

                    <Separator />

                    <div>
                        Difficulty:    {recipe.difficulty}    <br />
                        Time:          {recipe.time}min       <br />
                        Cost:          {"$".repeat(recipe.cost)}
                    </div>

                    <Separator />

                    <div>
                        Ingredients: <br />
                        <ul className="ml-4">
                            {recipe.ingredients?.map((ingredient) => (
                                <li className="list-disc">{ingredient.amount} {ingredient.item.name}</li>
                            ))}
                        </ul>
                    </div>

                    <Separator />

                    <div>
                        How to make this recipe: <br />
                        {recipe.recipeText}
                    </div>


                    {/* Button for creating a shopping list based on the user's missing items */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="w-full" variant="secondary">Create a shopping list</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Create shoppinglist</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCreateList}>Create</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Button for deleting the items in the recipe from the user's fridge */}
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button className="w-full" variant="destructive">Remove ingredients from fridge</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure? </AlertDialogTitle>
                                <AlertDialogDescription>This will delete all the ingredients from your fridge</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteFridgeItems}>Confirm</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>

        </div>
    );
}

export { RecipeDetails };
