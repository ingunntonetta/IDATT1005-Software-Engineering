import { BackPageHeader } from "@/components/back-page-header";
import { CardItem } from "@/components/card-item";
import { useTheme } from "@/components/theme-provider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@/datatypes";
import userService from "@/services/user";
import { Home, LogOut, Moon, Sun } from "lucide-react";
import * as React from "react";

// Component for the profile page
const Profile: React.FC = () => {
    const { toast } = useToast();
    const { setTheme } = useTheme();

    const [user, setUser] = React.useState({} as User);

    // Fetch the user's data
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
        <div className="flex items-center flex-col w-full p-4">
            <BackPageHeader title="Profile" />

            {/* Show the user's avatar and username*/}
            {(user.avatarUrl == "") ?
                <Skeleton className="h-28 w-28 mt-4 rounded-full" />
                :
                <Avatar className="h-28 w-28 mt-4">
                    <AvatarImage src={user.avatarUrl} />
                </Avatar>
            }

            {(user.username == "") ?
                <Skeleton className="mt-2 h-4 w-[10rem]" /> :
                <span className="mt-2 text-slate-500 dark:text-slate-400 transition duration-500">@{user.username}</span>
            }


            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <Separator />
                </CardHeader>

                <CardContent className="flex flex-col gap-8">
                    <CardItem link="/household">
                        <Home /> Household
                    </CardItem>

                    {/* Dropdown for changing themes */}
                    <CardItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <CardItem>
                                    <Sun className="rotate-0 scale-100 transition-all duration-500 dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute rotate-90 scale-0 transition-all duration-500 dark:rotate-0 dark:scale-100" />
                                    <span>Change theme</span>
                                </CardItem>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                    Light
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                    Dark
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                    System
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardItem>

                    {/* Alert dialog before logging out */}
                    <AlertDialog>
                        <AlertDialogTrigger>
                            <CardItem><LogOut /> Log out</CardItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                    toast({
                                        title: "Logged out",
                                        variant: "default",
                                        duration: 1500,
                                    })
                                    location.href = "/api/v1/auth/logout"
                                }}>Log out</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    );
};

export { Profile };
