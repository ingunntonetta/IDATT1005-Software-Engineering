import { BackPageHeader } from "@/components/back-page-header";
import { CardItem } from "@/components/card-item";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { HouseholdMember, User } from "@/datatypes";
import householdService from "@/services/household";
import userService from "@/services/user";
import { DialogDescription } from "@radix-ui/react-dialog";
import { ArrowRightLeft, DoorOpen, KeyRound, Pencil } from "lucide-react";
import * as React from "react";

// The component for the household page
const Household: React.FC = () => {
    const { toast } = useToast();

    const [user, setUser] = React.useState({} as User);
    const [members, setMembers] = React.useState<HouseholdMember[]>([]);
    const [newHouseholdName, setNewHouseholdName] = React.useState("");
    const [newJoinCode, setNewJoinCode] = React.useState("");
    const [reload, setReload] = React.useState(false);

    // Load all info about the user and their household
    React.useEffect(() => {
        userService.getMe()
            .then(setUser)
            .then(householdService.members)
            .then(setMembers)
            .catch((error) => {
                if (error.response.status === 401) window.location.href = "/login";
            });
    }, [reload]);

    const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewHouseholdName(e.target.value);
    };

    const handleChangeJoinCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewJoinCode(e.target.value);
    };

    // Handler for editing the household name
    const handleEditHousehold = () => {
        if (!newHouseholdName || newHouseholdName === user.houseHold.name) return;

        householdService.edit(newHouseholdName)
            .then(() => {
                setUser((prev) => ({ ...prev, houseHold: { ...prev.houseHold, name: newHouseholdName } }));
            })
            .catch((error) => {
                console.error(error);
                toast({
                    variant: "destructive",
                    duration: 1500,
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                });
            });
    };

    // Handler for joining a household
    const handleJoinHousehold = () => {
        if (!newJoinCode) return;

        householdService.join(newJoinCode)
            .then(() => {
                toast({
                    title: "Successfully joined household",
                    variant: "success",
                    duration: 1500,
                })
                setReload(!reload);

            })
            .catch((error) => {
                if (error.response.status == 400) {
                    toast({
                        variant: "destructive",
                        duration: 1500,
                        title: "Invalid join code"
                    });
                    return;
                } else {
                    toast({
                        variant: "destructive",
                        duration: 1500,
                        title: "Uh oh! Something went wrong.",
                        description: "There was a problem with your request.",
                    });
                }
            });
    };

    // Handler for leaving a household
    const handleLeaveHouseHold = () => {
        householdService.leave()
            .then(() => {
                toast({
                    title: "Left household",
                    variant: "default",
                    duration: 1500,
                })
                setReload(!reload);
            })
            .catch((error) => {
                console.error(error);
                toast({
                    variant: "destructive",
                    duration: 1500,
                    title: "Uh oh! Something went wrong.",
                    description: "There was a problem with your request.",
                })
            });
    }

    return (
        <div className="flex items-center flex-col w-full p-4">
            <BackPageHeader title="Household" />

            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="align-center">{user.houseHold ? user.houseHold.name : ""}</CardTitle>
                    <CardDescription>{user.houseHold ? new Date(user.houseHold.createdAt).toLocaleDateString() : ""}</CardDescription>
                    <Separator />
                </CardHeader>

                <CardContent className="flex flex-col gap-8">
                    {/* View join code card item */}
                    <AlertDialog>
                        <AlertDialogTrigger>
                            <CardItem><KeyRound /> View join code</CardItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{user.houseHold ? user.houseHold.joinCode : ""}</AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogAction onClick={() => {
                                    navigator.clipboard.writeText(user.houseHold ? user.houseHold.joinCode : "");
                                    toast({
                                        title: "Join code copied to clipboard",
                                        duration: 1000,
                                    });
                                }}>Copy</AlertDialogAction>
                            </AlertDialogFooter>
                            <AlertDialogAction className="bg-secondary text-foreground" onClick={() => { }}> Cancel
                            </AlertDialogAction>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Change household name card item */}
                    <Dialog>
                        <DialogTrigger>
                            <CardItem><Pencil /> Change name</CardItem>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit household name</DialogTitle>
                            </DialogHeader>
                            <Input defaultValue={user.houseHold ? user.houseHold.name : ""} maxLength={24} onChange={handleChangeName} className="text-center" />
                            <DialogClose asChild>
                                <Button type="submit" onClick={() => {
                                    handleEditHousehold();
                                    toast({
                                        title: "Household name updated",
                                        duration: 1500,
                                    });
                                }
                                }>Save changes</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>

                    {/* Join new household card item */}
                    <Dialog>
                        <DialogTrigger>
                            <CardItem><ArrowRightLeft /> Join new household</CardItem>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Enter join code</DialogTitle>
                                <DialogDescription>
                                    You will lose access to everything in your current household.
                                </DialogDescription>
                            </DialogHeader>
                            <Input maxLength={8} onChange={handleChangeJoinCode} className="text-center" />
                            <DialogClose asChild>
                                <Button type="submit" onClick={handleJoinHousehold}>Join</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>

                    {/* Leave household card item */}
                    <Dialog>
                        <DialogTrigger>
                            <CardItem><DoorOpen /> Leave household</CardItem>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you sure?</DialogTitle>
                                <DialogDescription>
                                    You will lose access to everything in your current household.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogClose asChild>
                                <Button onClick={handleLeaveHouseHold}>Leave</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="secondary">Cancel</Button>
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Card showing all the members in the user's household */}
            <Card className="mt-8 w-full">
                <CardHeader>
                    <CardTitle>Members</CardTitle>
                    <Separator />
                </CardHeader>
                <CardContent className="flex flex-col gap-8">
                    {members.map((member) => (
                        <CardItem className="items-center">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={member.avatarUrl} />
                            </Avatar>
                            <span className="text-lg">{member.firstName} {member.lastName}</span>
                        </CardItem>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};

export { Household };
