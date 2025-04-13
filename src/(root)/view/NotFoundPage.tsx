import { Link } from "react-router-dom"

const NotFoundPage = () => {
    return (
        <div className="w-full h-screen flex flex-col justify-center items-center">
            <h1 className="text-6xl font-bold tracking-widest my-5">Page Not Found</h1>
            <div className="justify-center items-center flex flex-col my-5">
                <h3 className="text-xl">We can't find the page you're looking for.</h3>
                <h3 className="text-xl">You can either return to the previous page, visit our homepage or contact our support team.</h3>
            </div>
            <div>
                {/** LINK */}
                <Link to={'/'}>
                    <button className="px-4 py-2 bg-blue-700 mx-5 text-white rounded-md font-bold tracking-wide hover:cursor-pointer hover:bg-blue-500">Visit Homepage</button>
                </Link>
                <Link to={'/support'}>
                    <button className="px-4 py-2 bg-blue-700 mx-5 text-white rounded-md font-bold tracking-wide hover:cursor-pointer hover:bg-blue-500">Contact Us</button>
                </Link>
            </div>
        </div>
    )
}

export default NotFoundPage