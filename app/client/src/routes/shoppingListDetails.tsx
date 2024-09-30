import { BackPageHeader } from "@/components/back-page-header";
import { ItemsSearch } from "@/components/item-search";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Item, ShoppingList, ShoppingListItem } from "@/datatypes";
import itemService from "@/services/items";
import shoppingListService from "@/services/shoppingLists";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Trash2 } from "lucide-react";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

// A specific item in the shopping list
const ListScrollItem: React.FC<{ archived?: boolean; item: ShoppingListItem; onCheck: (item: ShoppingListItem) => void; onRemove: (item: ShoppingListItem) => void; }> = ({ archived, item, onCheck, onRemove }) => {
    const handleCheck = (checked: CheckedState) => {
        item.purchased = checked as boolean;
        onCheck(item);
    }

    return (
        <div>
            <div className="flex justify-between pl-1 pr-3 pt-4 pb-4">
                {!archived &&
                    <Checkbox className="w-8 h-8" checked={item.purchased} onCheckedChange={handleCheck}></Checkbox>
                }
                <div className="flex-1 overflow-hidden max-w-44">
                    {item.item.name}
                </div>
                {!archived &&
                    <Trash2 onClick={() => { onRemove(item) }} />
                }
            </div>
            <Separator />
        </div>
    );
};

// Scroll area of all the items in the shopping ist
const ListScrollArea: React.FC<{ archived?: boolean; ListItems: ShoppingListItem[]; onCheck: (item: ShoppingListItem) => void; onRemove: (item: ShoppingListItem) => void; }> = ({ archived, ListItems, onCheck, onRemove }) => (
    <div className="h-3/5 pb-2">
        <ScrollArea className="pl-4 pr-4 rounded-md border h-full bg-card">
            {ListItems.map((item, index) => (
                <ListScrollItem key={index} archived={archived} item={item} onCheck={onCheck} onRemove={onRemove}></ListScrollItem>
            ))}
        </ScrollArea>
    </div>
);

// Component for a specific shopping list
const ShoppingListDetail: React.FC = () => {
    const { toast } = useToast();
    const { id } = useParams();
    const navigate = useNavigate();

    const [listItems, setListItems] = React.useState<ShoppingListItem[]>([]);
    const [items, setItems] = React.useState<Item[]>([]);
    const [reload, setReload] = React.useState<boolean>(false);
    const [list, setList] = React.useState<ShoppingList>({
        archived: false,
        description: "",
        householdId: "",
        id: 0,
        name: "",
        updatedAt: null,
        items: []
    });

    const sortedListItems = listItems.sort((a, b) => a.item.name.localeCompare(b.item.name));

    // Fetch the current shopping list, and also all possible items
    React.useEffect(() => {
        shoppingListService.get(parseInt(id as string))
            .then((response) => {
                setList(response.data as ShoppingList)
                setListItems(response.data.items as ShoppingListItem[])
            })
            .catch((error) => console.error(error))

        itemService.getAll()
            .then((response) => { setItems(response.data); })
            .catch((error) => console.error(error))
    }, [id, reload]);

    const handleCheck = (item: ShoppingListItem): void => {
        shoppingListService
            .purchase(list.id, item.item.id)
            .then(() => {
                // Sort alphabetically on name
                setListItems(prevListItems => prevListItems.map(i => i.item.id === item.item.id ? { ...i, checked: !i.purchased } : i));
            })
            .catch((error) => console.error(error))
    }

    // Handler for removing an item from a shopping list
    const handleRemove = (item: ShoppingListItem): void => {
        shoppingListService.removeItem(list.id, item.item.id)
            .then((response) => {
                setListItems(prevListItems => prevListItems.filter(i => i.item.id !== response.data.itemId));
                toast({
                    title: `${item.item.name} removed from list`,
                    variant: "default",
                    duration: 500,
                });
            })
            .catch((error) => {
                console.error(error);
                toast({
                    variant: "destructive",
                    title: "Failed to remove item",
                    duration: 2000,
                });
            });
    }

    // Handler for marking a shopping list as archived
    const handleArchive = (): void => {
        shoppingListService.archive(list.id)
            .then((response) => {
                toast({
                    title: list.archived ? "List restored" : "List archived",
                    variant: list.archived ? "success" : "default",
                    duration: 1500,
                });
                response.data.archived ?
                    navigate(response.redirect) :
                    setReload(!reload);
            })
            .catch((error) => {
                console.error(error);
                toast({
                    variant: "destructive",
                    title: "Failed to archive list",
                    duration: 2000,
                });
            });
    }

    // Handler for adding an item to a shopping list
    const handleAdd = (itemId: number): void => {
        shoppingListService
            .add(list.id, itemId)
            .then(() => {
                setListItems([...listItems, { item: items.find(i => i.id === itemId) as Item, purchased: false }]);
                toast({
                    title: `${items.find(i => i.id === itemId)?.name} added to list`,
                    variant: "default",
                    duration: 500,
                })
            })
            .catch((error) => {
                console.error(error);
                toast({
                    variant: "destructive",
                    title: "Failed to add item",
                    duration: 2000,
                });
            });
    }

    // Handler for when a new item is created
    const handleNew = (item: Item): void => {
        shoppingListService.add(list.id, item.id)
            .then(() => {
                setListItems([...listItems, { item: item, purchased: false }]);
            })
            .catch((error) => {
                console.error(error);
                toast({
                    variant: "destructive",
                    title: "Failed to create item",
                    duration: 2000,
                });
            });
    }

    // Handler for deleting a shopping list
    const handleDelete = () => {
        shoppingListService
            .delete(list.id)
            .then(() => {
                toast({
                    variant: "default",
                    title: "Shoppinglist Deleted",
                    duration: 1500,
                });
                navigate("/shopping-lists");
            })
            .catch((error) => {
                console.error(error);
                toast({
                    variant: "destructive",
                    title: "Failed to delete shopping list",
                    duration: 2000,
                });
            });
    };

    return (
        <div className="p-4 flex flex-col h-screen overscroll-none">
            <BackPageHeader title={list.name} />
            <div className="text-center p-4">{list.description}</div>
            {/* Only show check marks and add item button for non-archived lists */}
            {list.archived && <ListScrollArea archived ListItems={sortedListItems} onCheck={handleCheck} onRemove={handleRemove} />}
            {!list.archived && <ListScrollArea ListItems={sortedListItems} onCheck={handleCheck} onRemove={handleRemove} />}
            {!list.archived &&
                <ItemsSearch items={
                    items.filter((item) => {
                        return !sortedListItems.some((listItem) => listItem.item.id === item.id)
                    }).sort((a, b) => a.name.localeCompare(b.name))} onAdd={handleAdd} onNewItem={handleNew} />
            }
            {/* Arcchive/unarchive button */}
            <Dialog>
                {!list.archived && <DialogTrigger asChild><Button className="my-3 w-full" variant="secondary">Archive</Button></DialogTrigger>}
                {list.archived && <DialogTrigger asChild><Button className="my-3 w-full" variant="secondary">Restore</Button></DialogTrigger>}
                <DialogContent>
                    <DialogHeader>
                        {!list.archived && <DialogTitle>Are you sure you are finished?</DialogTitle>}
                        {list.archived && <DialogTitle>Are you sure you want to restore this list?</DialogTitle>}
                    </DialogHeader>
                    <DialogClose asChild>
                        <Button type="submit" onClick={handleArchive}>Yes</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>

            {/* Delete button */}
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="my-3 w-full" variant="destructive"> Delete</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure you want to delete this list?</DialogTitle>
                    </DialogHeader>
                    <DialogClose asChild>
                        <Button type="submit" onClick={handleDelete}>Yes</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                    </DialogClose>
                </DialogContent>
            </Dialog>

        </div >
    );
};


export { ShoppingListDetail };
