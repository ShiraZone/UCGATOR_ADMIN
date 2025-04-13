type Props = {
    message?: string;
}

const GlobalLoadingIndicator = ({ message }: Props) => {
    return (
        <div className="fixed inset-0 bg-black/75 bg-opacity-50 flex flex-col items-center justify-center z-50">
            <div className='w-50 h-50 border-10 border-t-blue-500 border-gray-300 rounded-full animate-spin'/>
            <p className="text-white my-5 text-2xl">{message || 'Loading...'}</p>
        </div>
    )
}

export default GlobalLoadingIndicator