import { Input } from "@/components/ui/input"
import { Button } from "./ui/button"
import { useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react"
const Signup = () => {
    const [input, setInput] = useState({
        username: "",
        email: "",
        password: ""
    })
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value })
    }
    const signupHandler = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await axios.post('http://localhost:8080/api/v1/user/register',
                input,
                {
                    headers: {
                        'Content-type': 'application/json'
                    },
                    withCredentials: true
                }
            );
            if (res.data.success) {
                const userId = res.data.user._id;
                navigate(`/profile/${userId}`);
                toast.success(res.data.message);
                setInput({
                    username: "",
                    email: "",
                    password: ""
                })
            }


        } catch (error) {
            toast.error(error.message.data.message)
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="flex items-center w-screen h-screen justify-center">
            <form onSubmit={signupHandler} className="shadow-lg flex flex-col gap-5 p-8">
                <div className="my-4">
                    <h1 className="text-center font-bold text-xl">REGISTER</h1>
                </div>
                <div>
                    <span className="font-medium">Username</span>
                    <Input type="text" name="username"
                        value={input.username}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2" />
                </div>
                <div>
                    <span className="font-medium">Email</span>
                    <Input type="email" name="email"
                        value={input.email}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2" />
                </div>
                <div>
                    <span className="font-medium">Password</span>
                    <Input type="password"
                        name="password"
                        value={input.password}
                        onChange={changeEventHandler}
                        className="focus-visible:ring-transparent my-2" />
                </div>
                {
                    loading ? (
                        <Button>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Please Wait
                        </Button>
                    ) : (
                        <Button type="submit">Signup</Button>
                    )
                }
                <span className="tex-center">Already have an account <Link to="/login" className="text-blue-600" >Login</Link> </span>
            </form>
        </div>
    )
}

export default Signup
