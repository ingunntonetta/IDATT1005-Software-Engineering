import { ItemsSearch } from "@/components/item-search";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { Item } from "@/datatypes";
import fridgeService from "@/services/fridge";
import itemService from "@/services/items";
import { CheckedState } from "@radix-ui/react-checkbox";
import * as React from "react";

type FridgeFrontendItem = {
    item: Item;
    checked: boolean;
};

// An item inside the scroll in the fridge
// Shows the item name and the checkbox for removing the item
const FridgeScrollItem: React.FC<{ item: FridgeFrontendItem; onCheck: (item: FridgeFrontendItem) => void }> = ({ item, onCheck }) => {
    const handleCheck = (checked: CheckedState) => {
        item.checked = checked as boolean;
        onCheck(item);
    }

    return (
        <div>
            <div className="flex items-center justify-between pl-8 pr-8 pt-4 pb-4">
                <div className="overflow-hidden max-w-44">{item.item.name}</div>
                <Checkbox className="w-8 h-8" checked={item.checked} onCheckedChange={handleCheck}></Checkbox>
            </div>

            <Separator />
        </div>
    );
};

// The scroll area of all the items in the fridge, simply renders a list of FridgeScrollItem
const FridgeScrollArea: React.FC<{ items: FridgeFrontendItem[]; onCheck: (item: FridgeFrontendItem) => void }> = ({ items, onCheck }) => (
    <div className="h-3/4">
        <ScrollArea className="pl-4 pr-4 rounded-md border h-full bg-card">
            {items.map((item, index) => (
                <FridgeScrollItem key={index} item={item} onCheck={onCheck}></FridgeScrollItem>
            ))}
        </ScrollArea>
    </div>
);

// The component that displays the main fridge page
const Fridge: React.FC = () => {
    const { toast } = useToast();

    const [fridgeItems, setFridgeItems] = React.useState<FridgeFrontendItem[]>([]);
    const [canRemove, setCanRemove] = React.useState<boolean>(false);
    const [allItems, setAllItems] = React.useState<Item[]>([]);

    const sortedItems = fridgeItems.sort((a, b) => a.item.name.localeCompare(b.item.name));

    // Load both the user's fridge items and all available items
    // In a proper app (not-MVP) you would not load all items, but rather fetch them as the user types
    React.useEffect(() => {
        fridgeService.items().then((items) => {
            setFridgeItems(items.map((item) => { return { item: item, checked: false } }));
        }).catch((error) => {
            console.error(error);
            toast({
                variant: "destructive",
                duration: 1500,
                title: "Failed to load fridge"
            });
        });

        itemService.getAll().then((res) => setAllItems(res.data)).catch((error) => {
            console.error(error);
            toast({
                variant: "destructive",
                duration: 1500,
                title: "Failed to fetch items"
            });
        });
    }, [toast]);

    // Handle the react state of checking of an item, and make the remove button active if any item is checked
    const handleCheck = (item: FridgeFrontendItem) => {
        const updatedItems = fridgeItems.map((i) => {
            if (i.item === item.item) {
                return { ...i, checked: item.checked };
            }
            return i;
        });

        setFridgeItems(updatedItems);
        setCanRemove(updatedItems.some((item) => item.checked));
    };

    // Bring back all the original items if the user clicks the undo toast
    const handleUndo = (originalItems: FridgeFrontendItem[]) => {
        fridgeService.add(originalItems.filter((item) => item.checked).map((item) => item.item.id))
            .then(() => {
                setFridgeItems(originalItems);
                setCanRemove(true);
            })
            .catch((error) => {
                console.error(error);
                toast({
                    variant: "destructive",
                    duration: 1500,
                    title: "Failed to undo removal"
                });
            });
    };

    // Remove all checked items from the fridge, and save the original items for the undo toast
    const handleRemove = () => {
        fridgeService.remove(fridgeItems.filter((item) => item.checked).map((item) => item.item.id))
            .then(() => {

                const originalItems = fridgeItems;
                const updatedItems = fridgeItems.filter((item) => !item.checked);

                setFridgeItems(updatedItems);
                setCanRemove(false);

                toast({
                    title: "Items removed",
                    duration: 2000,
                    action: <ToastAction altText="undo" onClick={() => { handleUndo(originalItems) }}> Undo</ToastAction >
                });
            })
            .catch((error) => {
                console.error(error);
                toast({
                    variant: "destructive",
                    duration: 1500,
                    title: "Failed to remove items"
                });
            });
    }

    // Add an item to the fridge, and show a toast with the result
    const handleAdd = (id: number) => {
        fridgeService.add([id])
            .then(() => {
                setFridgeItems([{ item: allItems.find((item) => item?.id === id) as Item, checked: false },
                ...fridgeItems
                ]);
                toast({
                    title: `${allItems.find(i => i.id === id)?.name} added to list`,
                    variant: "default",
                    duration: 1000,
                })
            })
            .catch((error) => {
                console.error(error);
                toast({
                    variant: "destructive",
                    duration: 1500,
                    title: "Failed to add item"
                });
            });
    };

    // If a new item is created, add it to the fridge
    const handleNewItem = (item: Item) => {
        setAllItems([...allItems, item]);

        fridgeService.add([item.id])
            .then(() => { setFridgeItems([{ item, checked: false }, ...fridgeItems]); })
            .catch((error) => {
                console.error(error);
                toast({
                    variant: "destructive",
                    duration: 1500,
                    title: "Failed to add item"
                });
            });
    };

    return (
        <>
            <FridgeScrollArea items={sortedItems} onCheck={handleCheck} />
            <div className="mt-4"><ItemsSearch items={allItems.filter((item) => {
                return !fridgeItems.some((fridgeItem) => fridgeItem.item.id === item.id);
            }).sort((a, b) => a.name.localeCompare(b.name))} onAdd={handleAdd} onNewItem={handleNewItem} /></div>
            <div className="mt-4">
                {canRemove && <Button className="w-full" variant="destructive" onClick={handleRemove}>Remove</Button>}
                {!canRemove && <Button className="w-full" variant="outline">Remove</Button>}
            </div >
        </>
    );
};

export { Fridge };
