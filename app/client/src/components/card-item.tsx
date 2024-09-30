import { cn } from "@/lib/utils";
import * as React from "react";
import { Link } from "react-router-dom";

// A component that renders an item in a card
// For example the card in the user's profile page
const CardItem: React.FC<{ children: React.ReactNode; link?: string; className?: string }> = ({ children, link, className }) => {
    if (link) {
        return (
            <Link to={link} className="w-full">
                <div className={cn("flex space-between gap-3", className)}>
                    {children}
                </div>
            </Link >
        )
    } else {
        return (
            <div className="w-full">
                <div className={cn("flex space-between gap-3", className)}>
                    {children}
                </div>
            </div>
        )
    }

};

export { CardItem };
