// REACT
import { KeyboardEvent } from "react";

// AUTH
import useSignIn from "react-auth-kit/hooks/useSignIn";

// IMAGE
import IMAGE from "../../constant/IMAGES";

// NAVIGATE
import { useNavigate } from "react-router-dom";

// ICONS
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { testConnection } from "../../config/config";

// TOAST
import { ToastContainer } from 'react-toastify';

// AXIOS
import axios from "axios";
import { useLoading } from "../../context/LoadingProvider";

const Login = () => {
    // ENVIRONMENT URL
    const url = import.meta.env.VITE_API_URL;
    // AUTH
    const signIn = useSignIn();
    // REACT-DOM
    const navigate = useNavigate();
    // FORMATTER
    const validEmailFormat = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Check if email is valid.
    // LOADING
    const { loading, setLoading } = useLoading();
    // DATA
    const [errorData, setErrorData] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            onSignInEvent(e); // Trigger login on Enter key press
        }
    }

    const handleTextChange = (key: keyof typeof formData, value: string) => { 
        setFormData({
            ...formData,
            [key]: value
        });
    }

    const onSignInEvent = async (event: any) => {
        event?.preventDefault();
        setErrorData(null);

        const email = formData.email;
        const password = formData.password;

        if(!email || !password) {
            setErrorData('Please provide your login credentials.')
            return;
        }

        if(!validEmailFormat(email)) {
            setErrorData('Invalid email')
            return;
        }

        setLoading(true, 'Signing in...');
        try {
            const response = await axios.post(`${url}/auth/sign-in`, { email, password })

            if (signIn({
                auth: { 
                    token: response.data.value.token,
                    type: "Bearer"
                },
                userState: { email: email }
            })) {
                navigate('/')
            }
        } catch (error: any) {
            console.log(error || error.response?.data?.error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        testConnection();
    }, [])

    return (
        <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundImage: `url(${IMAGE.ImageBackgroundBase1})`, backgroundSize: "cover", backgroundPosition: "center", }} >
            <div className="w-full min-h-screen bg-gradient-to-r from-black via-blue-400/65 to-yellow-400/85 flex items-center justify-center backdrop-opacity-60">
                <ToastContainer />
                <div className="flex items-center justify-around w-full">
                    <div className="p-5 w-fit">
                        <div>
                            <h1 className="text-white text-5xl font-bold tracking-wider">Welcome</h1>
                            <div className="flex flex-col my-2 gap-0">
                                <h3 className="text-white text-lg font-semibold tracking-wide">Revolutionizing how we navigate universities.</h3>
                                <h3 className="text-white text-lg font-semibold tracking-wide">Save time with UCGator.</h3>
                            </div>
                        </div>
                        {errorData && (
                            <p className="text-red-500 text-sm font-bold italic tracking-wide">{`* ${errorData}`}</p>
                        )}
                        <div 
                            className="mt-5 w-full">
                            <div 
                                className={`mb-5 w-full flex flex-row rounded-md relative ${errorData && !formData.email ? 'border-1 border-red-500' : ''}`}>
                                <input 
                                    type="text" 
                                    id="email" 
                                    name="email" 
                                    placeholder="Email" 
                                    className={`bg-white w-full py-3 px-3 box-border rounded-tl-md rounded-bl-md`} 
                                    required 
                                    onChange={(e) => handleTextChange("email", e.target.value)}
                                    onKeyDown={handleKeyDown} // Add keydown event listener
                                    disabled={ loading }
                                />
                                <div 
                                    className="bg-blue-800 p-3 rounded-tr-md rounded-br-md"
                                    >
                                    <FontAwesomeIcon 
                                        icon={faUser} 
                                        style={{ color: "white" }} 
                                        size="xl" 
                                    />
                                </div>
                            </div>
                            <div 
                                className={`mb-5 w-full flex flex-row rounded-md relative ${errorData && !formData.password ? 'border-2 border-red-500' : ''}`}>
                                <input 
                                    type="password" 
                                    id="password" 
                                    name="password" 
                                    placeholder="Password" 
                                    className="bg-white w-full py-3 px-3 box-border rounded-tl-md rounded-bl-md" 
                                    required 
                                    onChange={(e) => handleTextChange("password", e.target.value)}
                                    onKeyDown={handleKeyDown} // Add keydown event listener
                                    disabled={ loading }
                                />
                                <div className="bg-blue-800 p-3 rounded-tr-md rounded-br-md">
                                    <FontAwesomeIcon 
                                        icon={faLock} 
                                        style={{ color: "white" }} 
                                        size="xl" />
                                </div>
                            </div>
                        </div>
                        <button 
                            className="border-2 border-white rounded-4xl w-full py-3 text-white text-xl font-semibold tracking-wider cursor-pointer hover:bg-white hover:text-black" 
                            onClick={(e) => onSignInEvent(e)}
                        >
                                LOGIN
                        </button>
                    </div>
                    <div>
                        <img 
                            src={IMAGE.UCGatorLogo} 
                            alt="ucgator_logo.png" 
                            className="w-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login