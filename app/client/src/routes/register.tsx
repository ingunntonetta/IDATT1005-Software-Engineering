import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { NewUser } from "@/datatypes"
import utils from "@/lib/utils"
import userService from "@/services/user.tsx"
import * as React from "react"
import { Link, useNavigate } from "react-router-dom"

// Component for the reigster page
const Register: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();

    // For displaying the errors
    const [errors, setErrors] = React.useState({
        fields: {
            all: "",
            email: "",
            username: "",
            password: "",
            matchingPassword: ""
        }
    });

    const [user, setUser] = React.useState({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        email: ""
    } as NewUser);

    const handleFirstname = (e: React.ChangeEvent<HTMLInputElement>) => setUser(prevUser => ({ ...prevUser, firstName: e.target.value }));
    const handleLastname = (e: React.ChangeEvent<HTMLInputElement>) => setUser(prevUser => ({ ...prevUser, lastName: e.target.value }));

    // Handler to verify the email format
    const handleEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;

        setUser((prevUser) => ({ ...prevUser, email: newEmail }));

        if (!newEmail.match(utils.emailRegex)) {
            setErrors((prevErrors) => ({
                fields: {
                    ...prevErrors.fields,
                    email: "The email address is not valid."
                }
            }));
        } else {
            setErrors((prevErrors) => ({
                fields: {
                    ...prevErrors.fields,
                    email: ""
                }
            }));
        }
    };

    // Handler to verif ythe username format
    const handleUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUsername = e.target.value;

        setUser(prevUser => ({ ...prevUser, username: newUsername }));

        if (!newUsername.match(utils.usernameRegex)) {
            setErrors(prevErrors => ({
                fields: {
                    ...prevErrors.fields,
                    username: "Username must be at least 3 characters long and contain only letters, numbers, and underscores."
                }
            }));
        } else {
            setErrors(prevErrors => ({
                fields: {
                    ...prevErrors.fields,
                    username: ""
                }
            }));
        }
    };

    // Handler to verify the password format
    const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;

        setUser((prevUser) => ({ ...prevUser, password: newPassword }));

        if (!newPassword.match(utils.passwordRegex) && newPassword.length > 0) {
            setErrors((prevErrors) => ({
                fields: {
                    ...prevErrors.fields,
                    password:
                        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
                }
            }));
        } else {
            setErrors((prevErrors) => ({
                fields: {
                    ...prevErrors.fields,
                    password: ""
                }
            }));
        }
    };

    // Handler to verify the password and confirm password match
    const handlePasswordCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
        const confirmPassword = e.target.value;
        if (confirmPassword !== user.password) {
            setErrors((prevErrors) => ({
                fields: {
                    ...prevErrors.fields,
                    matchingPassword: "Passwords do not match."
                }
            }));
        } else {
            setErrors((prevErrors) => ({
                fields: {
                    ...prevErrors.fields,
                    matchingPassword: ""
                }
            }));
        }
    };

    // Handler for the register button
    const handleRegister = async () => {
        if (user.firstName === "" || user.lastName === "" || user.email === "" || user.username === "" || user.password === "") {
            return toast({
                title: "Please fill in all fields",
                variant: "destructive",
                duration: 1500,
            });
        } else {
            await userService.register(user)
                .then(() => {
                    navigate("/fridge")
                })
                .catch((error) => {
                    toast({
                        title: error.data.message,
                        variant: "destructive",
                        duration: 1500,
                    })
                });
        }
    };

    return (
        <>
            <div className="flex flex-col items-center py-0 w-full h-screen place-content-center">
                <Card className="mx-auto max-w-sm4 mx-2 h-5/5">
                    <CardHeader className="space-y-1 h-min">
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        {errors.fields.all && <CardDescription className="text-red-500">{errors.fields.all}</CardDescription>}
                    </CardHeader>
                    <CardContent className="">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Input
                                    placeholder="First name"
                                    id="firstname"
                                    required
                                    onChange={handleFirstname}
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Last name"
                                    id="lastname"
                                    required
                                    onChange={handleLastname}
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Email"
                                    id="email"
                                    required
                                    onChange={handleEmail}
                                />
                            </div>
                            {errors.fields.email && <CardDescription className="text-red-500">{errors.fields.email}</CardDescription>}
                            <div className="space-y-2">
                                <Input
                                    placeholder="Username"
                                    id="username"
                                    required
                                    onChange={handleUsername}
                                />
                            </div>
                            <div className="space-y-2">
                                <Input
                                    placeholder="Password"
                                    id="password"
                                    required
                                    type="password"
                                    onChange={handlePassword}
                                />
                            </div>
                            {errors.fields.password && <CardDescription className="text-red-500">{errors.fields.password}</CardDescription>}
                            <div className="space-y-2">
                                <Input
                                    placeholder="Confirm password"
                                    id="confirmPassword"
                                    required
                                    type="password"
                                    onChange={handlePasswordCheck}
                                />
                            </div>
                            {errors.fields.matchingPassword && <CardDescription className="text-red-500">{errors.fields.matchingPassword}</CardDescription>}
                            <Button
                                className="w-full"
                                type="submit"
                                onClick={handleRegister}>
                                Create
                            </Button>
                            <p className="w-full text-center">or</p>
                            <Button className="w-full" onClick={() => { location.href = "/api/v1/auth/google/login" }}>
                                Sign up with Google
                            </Button>
                            <div className="w-full">
                                <Link
                                    to="/login"
                                    className="text-blue-500">
                                    Already have an account? Login here!
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}


export { Register }
