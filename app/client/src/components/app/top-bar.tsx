import Typography from "@/components/typography";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/datatypes";
import userService from "@/services/user";
import * as React from "react";
import { Link, useLocation } from "react-router-dom";

// Depending on the current location, the title of the page is displayed in the top bar.
const titles: { [key: string]: string } = {
    "": "HOME",
    "fridge": "FRIDGE ITEMS",
    "shopping-lists": "SHOPPING LISTS",
    "recipes": "RECIPES"
}

// This component is the top bar displayed on the 3 main pages
// It shows the page title and the user's avatar
const TopBar: React.FC = () => {
    const location = useLocation();
    const title = titles[location.pathname.split("/")[1]];
    const [user, setUser] = React.useState({} as User);

    // Fetch the user data to display the avatar in the top bar, if the user is not logged in, redirect to the login page.
    React.useEffect(() => {
        userService.getMe()
            .then(setUser)
            .catch((error) => {
                if (error.response.status === 401) {
                    window.location.href = "/login";
                }
            });
    }, []);

    return (
        <div>
            <div className="flex justify-between p-2">
                <Typography variant={"h2"} className="pt-8 pl-4">{title}</Typography>

                <Link to="/profile">

                    {(user.avatarUrl == "") ?
                        <Skeleton className="h-16 w-16 mr-4 mt-4 rounded-full" />
                        :
                        <Avatar className="h-16 w-16 mr-4 mt-4">
                            <AvatarImage src={user.avatarUrl} />
                        </Avatar>
                    }
                </Link>
            </div>
            <Separator />
        </div>
    )
};

export { TopBar };
