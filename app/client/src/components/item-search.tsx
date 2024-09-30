import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { Item } from "@/datatypes";
import utils, { cn } from "@/lib/utils";
import itemService from "@/services/items";
import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";

// The component that allows the user to search for, or create a new item, and add it somewhere
// such as to the fridge, to a shopping list or a recipe
// 
// It takes in:
//  - items: all the items it should show
//  - onAdd: a callback which is ran when the user clicks the add button
//  - onNewItem: a callback which is ran when the user creates a new item
//  - secondary: a boolean that determines if the component should show an input for the amount
const ItemsSearch: React.FC<{
    items: Item[];
    onAdd: (id: number, amount?: string) => void;
    onNewItem: (item: Item) => void;
    secondary?: boolean
}> = ({ items, onAdd, onNewItem, secondary }) => {
    const { toast } = useToast();

    const [open, setOpen] = React.useState(false);
    const [selectedItem, setSelectedItem] = React.useState<Item | null>(null);
    const [search, setSearch] = React.useState("");
    const [amount, setAmount] = React.useState("");

    // When the user clicks the add button and the info is properly filled in,
    // run the onAdd callback and reset the input fields
    const handleAdd = () => {
        if (selectedItem && !secondary) {
            onAdd(selectedItem.id);
            setOpen(false);
            setSelectedItem(null);
            return;
        }
        if (selectedItem && secondary && amount !== "") {
            onAdd(selectedItem.id, amount);
            setOpen(false);
            setSelectedItem(null);
            return;
        }
    };

    const handleChangeNewItem = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    // Called when the user creates a new item
    const handleCreateItem = () => {
        if (!utils.itemNameRegex.test(search)) {
            toast({
                variant: "destructive",
                duration: 5000,
                title: "Invalid item name",
                description: "Item name can only contain letters"
            });
            return;
        }

        // Create the new item and run the onNewItem callback
        itemService.create(search)
            .then((response) => {
                onNewItem(response.data);
                setOpen(false);
                if (secondary) {
                    setSelectedItem(response.data);
                } else {
                    setSelectedItem(null);
                }
            })
            .catch(() => {
                toast({
                    variant: "destructive",
                    duration: 1500,
                    title: "Failed to create item",
                });
            });
    };

    // A shadcn/ui combobox (https://ui.shadcn.com/docs/components/combobox)
    // With the necessary modifications to fit the needs of the component
    // Such as a create new item button if the item is not found
    // And logic that fits our needs
    return (
        <div className="flex space-x-4">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full">
                        {selectedItem ? items.find((item) => item === selectedItem)?.name : "Add a new item..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger >
                {secondary && <Input
                    placeholder="Amount"
                    type="string"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />}
                {((selectedItem && secondary && amount != "") || selectedItem && !secondary) ?
                    <Button onClick={handleAdd}>Add</Button> :
                    <Button variant="outline">Add</Button>}

                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput onValueChange={setSearch} placeholder="Search items..." />
                        <CommandEmpty>
                            Item not found..<br />
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="h-8" onClick={() => {
                                        setSearch(search.charAt(0).toUpperCase() + search.slice(1).toLowerCase());
                                    }}>Create new item</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Enter item name</DialogTitle>
                                    </DialogHeader>
                                    <Input value={search} onChange={handleChangeNewItem} maxLength={32} required className="text-center" />
                                    <DialogClose asChild>
                                        <Button type="submit" onClick={handleCreateItem}>Create</Button>
                                    </DialogClose>
                                    <DialogClose asChild>
                                        <Button variant="secondary">Cancel</Button>
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>
                        </CommandEmpty>
                        <CommandGroup className="max-h-[20rem] overflow-scroll">
                            {items.map((item) => (
                                <CommandItem
                                    key={item.id}
                                    value={item.name.toString()}
                                    onSelect={(currentValue) => {
                                        setSelectedItem(currentValue === item.name ? null : item);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedItem === item ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {item.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover >
        </div >
    );
};

export { ItemsSearch };

