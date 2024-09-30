import { Separator } from "@/components/ui/separator";
import { CookingPot, Refrigerator, ShoppingCart } from "lucide-react";
import * as React from "react";
import { Link } from "react-router-dom";

// The bottom navbar that shows icons for the 3 main pages
const NavBar: React.FC = () => {
    return (
        <div className="fixed bottom-0 w-screen h-16 bg-background">
            <Separator />
            <div className="flex h-full">
                <button className="basis-1/3 h-full"><Link to="/shopping-lists">
                    <ShoppingCart strokeWidth={1} size={42} className="m-auto" />
                </Link></button>

                <button className="basis-1/3 h-full"><Link to="/fridge">
                    <Refrigerator strokeWidth={1} size={42} className="m-auto" />
                </Link></button>

                <button className="basis-1/3 h-full"><Link to="/recipes">
                    <CookingPot strokeWidth={1} size={42} className="m-auto" />
                </Link></button>
            </div>
        </div>
    )
}

export { NavBar };
