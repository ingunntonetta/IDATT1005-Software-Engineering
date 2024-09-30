import { BackPageHeader } from "@/components/back-page-header";
import { ItemsSearch } from "@/components/item-search";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Item, NewRecipe } from "@/datatypes";
import itemService from "@/services/items";
import recipeService from "@/services/recipes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Trash2 } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";

// The component for the recipe create page
const RecipeCreate: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [items, setItems] = React.useState<Item[]>([]);
    const [recipe, setRecipe] = React.useState<NewRecipe>({
        title: "",
        recipeText: "",
        description: "",
        difficulty: 1,
        time: 0,
        cost: 1,
        imageUrl: "",
        ingredients: [],
    });

    // Load all the possible items
    React.useEffect(() => {
        itemService.getAll()
            .then((response) => { setItems(response.data) })
            .catch((error) => console.error(error))
    }, []);

    const handleCancel = () => {
        navigate("/recipes");
    }

    // Feedback for the user if they are missing any fields
    const checkRecipe = (): string | void => {
        if (recipe.title === "") return "Missing title";
        if (recipe.description === "") return "Missing description";
        if (recipe.recipeText === "") return "Missing recipe text";
        if (recipe.time < 1 || Number.isNaN(recipe.time)) return "Missing time";
        if (recipe.ingredients.length < 1) return "Missing ingredients";
    }

    // Create the recipe, toast the user if they are missing any fields
    const handleCreate = () => {
        const missingProperty: string | void = checkRecipe();

        if (missingProperty) {
            return toast({
                title: missingProperty,
                variant: "destructive",
                duration: 1500,
            });
        }

        recipeService.create(recipe)
            .then((response) => {
                toast({
                    title: "Recipe created",
                    variant: "success",
                    duration: 1500,
                });

                navigate(response.redirect);
            })
            .catch((error) => console.error(error))
    }

    // Handle the adding of a new ingredient to the recipe
    const handleAdd = (id: number, amount: string | undefined): void => {
        const item = items.find((item) => item.id === id);
        if (!item) return;
        const ingredient: { amount: string; item: Item; } = { amount: amount as string, item: item };
        setRecipe({ ...recipe, ingredients: [...recipe.ingredients, ingredient] });
    };

    // Handle the creation of a new itme in the itemsearch dropdown
    const handleNew = (item: Item) => {
        setItems([item, ...items]);
        toast({
            title: `${item.name} added to items`,
            duration: 1500,
        });
    };

    return (
        <div className="flex items-center flex-col w-full p-4">
            <BackPageHeader title="Create Recipe" />

            {/* Text/number input fields for title, description and time  */}
            <Input
                placeholder="Title"
                value={recipe.title}
                className="mb-4"
                onChange={(e) => setRecipe({ ...recipe, title: e.target.value })}
            />
            <Input
                placeholder="Description"
                value={recipe.description}
                className="mb-4"
                onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                maxLength={255}
            />
            <div className="flex items-center mb-4 items-center">
                <label htmlFor="time" className="mr-2 w-2/4">Time in minutes:</label>
                <Input
                    id="time"
                    value={recipe.time ? recipe.time.toString() : ""}
                    type="number"
                    className="w-2/4"
                    placeholder="Time in minutes"
                    onChange={(e) => setRecipe({ ...recipe, time: parseInt(e.target.value) })}
                    maxLength={255}
                />
            </div>

            {/* Dropdowns for cost and difficulty */}
            <div className="flex justify-between w-full px-16 pb-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">{`Cost: ${recipe.cost}`}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="">
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={`${recipe.cost}`} onValueChange={(e) => setRecipe({ ...recipe, cost: parseInt(e) })}>
                            <Card className="px-8 bg-background cursor-pointer">
                                <DropdownMenuRadioItem value="1" className="py-1">$</DropdownMenuRadioItem>
                                <hr className="absolute inset-x-3" />
                                <DropdownMenuRadioItem value="2" className="py-1">$$</DropdownMenuRadioItem>
                                <hr className="absolute inset-x-3" />
                                <DropdownMenuRadioItem value="3" className="py-1">$$$</DropdownMenuRadioItem>
                            </Card>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">{`Difficulty: ${recipe.difficulty}`}</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="">
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={`${recipe.difficulty}`} onValueChange={(e) => setRecipe({ ...recipe, difficulty: parseInt(e) })}>
                            <Card className="px-8 bg-background cursor-pointer">
                                <DropdownMenuRadioItem value="1" className="py-1">Easy</DropdownMenuRadioItem>
                                <hr className="absolute inset-x-3" />
                                <DropdownMenuRadioItem value="2" className="py-1">Medium</DropdownMenuRadioItem>
                                <hr className="absolute inset-x-3" />
                                <DropdownMenuRadioItem value="3" className="py-1">Hard</DropdownMenuRadioItem>
                            </Card>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Inputs for the recipe and the image url */}
            <Textarea
                placeholder="Steps to make the recipe"
                value={recipe.recipeText}
                className="mb-4 h-48"
                onChange={(e) => setRecipe({ ...recipe, recipeText: e.target.value })}
            />
            <Input
                placeholder="Image URL"
                value={recipe.imageUrl}
                className="mb-4"
                onChange={(e) => setRecipe({ ...recipe, imageUrl: e.target.value })}
            />

            {/* Items search component (for adding ingredients to the recipe) */}
            <ItemsSearch items={
                items.filter((item) => {
                    return !recipe.ingredients.some((ingredient) => ingredient.item.id === item.id)
                }).sort((a, b) => a.name.localeCompare(b.name))}
                onAdd={handleAdd} onNewItem={handleNew} secondary />

            {/* Show all ingredients added to the recipe */}
            {
                recipe.ingredients.map((ingredient) => (
                    <Card className="flex justify-center items-center mb-2 w-3/4">
                        <div className="w-full text-center">
                            {ingredient.amount}: {ingredient.item.name}
                        </div>
                        <Trash2 size={40} className="pr-4" onClick={() => {
                            setRecipe({ ...recipe, ingredients: recipe.ingredients.filter((i) => i.item.id !== ingredient.item.id) })
                        }} />
                    </Card>
                ))
            }
            <div className="flex justify-between px-4 py-2 w-full">
                <Button variant={"destructive"} onClick={handleCancel} className="py-2 text-lg">Cancel</Button>
                <Button variant={"default"} onClick={handleCreate} className="py-2 text-lg">Create</Button>
            </div>
        </div>
    );
};

export { RecipeCreate };
