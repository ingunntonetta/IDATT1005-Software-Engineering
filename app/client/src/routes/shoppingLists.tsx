import { CardItem } from "@/components/card-item";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingList } from "@/datatypes";
import shoppingListService from "@/services/shoppingLists.tsx";
import { PlusCircle } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const ShoppingLists: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
    const [showArchived, setShowArchived] = useState<boolean>(false);
    const displayLists: ShoppingList[] = shoppingLists.filter((list) => list.archived == showArchived);
    const [newTitle, setNewTitle] = useState<string>("New list");
    const [newDescription, setNewDescription] = useState<string>("");
    const [secondDialog, setSecondDialog] = useState<boolean>(false);

    useEffect(() => {
        shoppingListService
            .getAll()
            .then((response) => {
                setShoppingLists(response.data)
            })
            .catch((error) => console.error(error))
    }, []);

    const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewTitle(e.target.value);
    }

    const handleChangeDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewDescription(e.target.value);
    }

    const createShoppingList = () => {
        setSecondDialog(false);
        shoppingListService
            .create(newTitle, [], newDescription)
            .then((response) => {
                toast({
                    title: "Shoppinglist created",
                    variant: "success",
                    duration: 1500,
                })
                navigate(response.redirect);
            })
            .catch((error) => console.error(error))
    }


    return (
        <div className="p-4">
            <div className="flex justify-between items-center space-x-2 mb-3">
                <div className="flex items-center space-x-2 ">
                    <Switch
                        checked={showArchived}
                        onClick={() => setShowArchived(!showArchived)}
                        id="showArchived"
                    />
                    <label htmlFor="showArchived">{showArchived ? "Archived" : "Active"}</label>
                </div>
                <Dialog>
                    <DialogTrigger>
                        <CardItem>
                            {!showArchived &&
                                <PlusCircle size={45} strokeWidth={1.5} />
                            }
                        </CardItem>
                    </DialogTrigger>
                    {
                        showArchived &&
                        <PlusCircle size={45} strokeWidth={1.5} color="Gray" />
                    }
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create new Shoppinglist</DialogTitle>
                        </DialogHeader>
                        <Input placeholder={"Title"} maxLength={24} onChange={handleChangeTitle} className="text-center" />
                        <DialogClose asChild>
                            <Button type="submit" onClick={() => { setSecondDialog(true) }}>Next</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant="secondary">Cancel</Button>
                        </DialogClose>
                    </DialogContent>
                </Dialog>
                <Dialog open={secondDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a description?</DialogTitle>
                        </DialogHeader>
                        <Textarea placeholder={"Description"} maxLength={255} onChange={handleChangeDescription} className="text-center" />
                        <DialogClose asChild>
                            <Button type="submit" onClick={createShoppingList}>Create</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button variant="secondary" onClick={() => { setSecondDialog(false) }}>Cancel</Button>
                        </DialogClose>
                    </DialogContent>
                </Dialog>

            </div>

            {
                displayLists
                    .map((list) =>
                        <Card key={list.id} className="my-1" onClick={() => {
                            navigate(`/shopping-lists/${list.id}`)

                        }}>
                            <CardHeader>
                                <CardTitle>{list.name}</CardTitle>
                                <CardDescription>{list.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    )

            }
        </div >
    );
};

export { ShoppingLists };
