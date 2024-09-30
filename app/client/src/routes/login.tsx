import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { LoginUser } from "@/datatypes"
import userService from "@/services/user.tsx"
import * as React from "react"
import { Link, useNavigate } from "react-router-dom"

// The login page component
const Login: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [user, setUser] = React.useState({ username: "", password: "" } as LoginUser);

    // Handlers for the inputs
    const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser(prevUser => ({ ...prevUser, username: e.target.value }));
    }

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUser(prevUser => ({ ...prevUser, password: e.target.value }));
    }

    // Handler for the log in button, give error if missing fields
    const handleLogin = async () => {
        if (user.username === "" || user.password === "") {
            return toast({
                title: "Please fill in all fields",
                variant: "destructive",
                duration: 1500,
            });
        } else {
            await userService.login(user)
                .then(() => navigate("/fridge"))
                .catch(() => toast({
                    title: "Invalid username or password",
                    variant: "destructive",
                    duration: 2000,
                }));
        }
    }

    return (
        <>
            <div className="absolute font-bold text-4xl w-full text-center" style={{ marginTop: "13vh" }}>FRIGO</div>

            <div className="flex flex-col items-center py-16 w-full h-screen place-content-center">
                <Card className="mx-auto max-w-sm4 mx-2">
                    <CardHeader className="space-y-1 h-min">
                        <CardTitle className="text-2xl font-bold">Login</CardTitle>
                        <CardDescription>Enter your username and password to login to your account</CardDescription>
                    </CardHeader>
                    <CardContent className="">
                        <div className="space-y-4">

                            <div className="space-y-2">
                                <Input placeholder="Username" id="username" required onChange={handleChangeUsername} />
                            </div>

                            <div className="space-y-2">
                                <Input placeholder="Password" id="password" required type="password" onChange={handleChangePassword} />
                            </div>

                            <Button className="w-full" type="submit" onClick={handleLogin}>Login</Button>

                            <p className="w-full text-center">or</p>

                            <Button className="w-full" onClick={() => { location.href = "/api/v1/auth/google/login" }}>Sign in with Google</Button>

                            <div className="w-full">
                                <Link to="/register" className="text-blue-500">Don't have an account? Register here</Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}


export { Login }
