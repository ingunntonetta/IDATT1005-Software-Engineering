import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import recipeService from "@/services/recipes";
import { PlusCircle } from "lucide-react";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { RecipeShortInfo } from "../datatypes";

// Component for the recipes page
const Recipes: React.FC = () => {
    const navigate = useNavigate();

    const [recipes, setRecipes] = React.useState<RecipeShortInfo[]>([]);
    const [search, setSearch] = React.useState<string>("");
    const filteredRecipes = recipes.filter((recipe) => recipe.title.toLowerCase().includes(search));

    // Load all recipes
    React.useEffect(() => {
        recipeService.getAll()
            .then((response) => {
                setRecipes(response.data)
            })
            .catch((error) => console.error(error));
    }, []);

    // In the MVP search is currently not implemented
    const handleSearch = (search: React.ChangeEvent<HTMLInputElement>): void => {
        setSearch(search.target.value)
    }

    return (
        <>
            <div className="flex justify-between items-center space-x-2 mb-3">
                <div className="flex items-center space-x-2 ">
                </div>
                <Input placeholder="Title..." onChange={handleSearch} disabled></Input>
                {/* Add search button here if we decide to add paging */}

                {/* Button for creating a new recipe */}
                <PlusCircle size={45} strokeWidth={1.5} onClick={() => {
                    navigate("/recipes/create")
                }} />
            </div>

            {/* Scrollarea with all the recipes and the absic info about them */}
            <ScrollArea className="h-101">
                {filteredRecipes.map((recipe) => (
                    <Card className="mx-auto max-w-sm4 mx-2 mb-2" key={recipe.id} onClick={() => navigate(`/recipes/${recipe.id}`)}>
                        <CardHeader className="pb-1">
                            {
                                recipe.imageUrl != null &&
                                <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-32 object-cover rounded-md" />
                            }
                            <CardTitle className="text-xl font-bold">{recipe.title}</CardTitle>
                            <CardDescription>{recipe.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>
                                Difficulty:    {recipe.difficulty}    <br />
                                Time:          {recipe.time}min       <br />
                                Cost:          {"$".repeat(recipe.cost)}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </ScrollArea>
        </>
    );
};

export { Recipes };
