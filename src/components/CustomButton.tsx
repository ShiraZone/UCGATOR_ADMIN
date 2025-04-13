
import React from 'react'

// ICON
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface TypeButton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title?: string;
    icon?: any | null;
}

const CustomButton: React.FC<TypeButton> = (props) => {
    const { title, icon, ...rest } = props;
    return (
        <button className='min-w-auto min-h-10 bg-uc-blue py-2 px-4 text-white font-semibold tracking-wide rounded-md hover:cursor-pointer hover:bg-blue-600 mr-2' {...rest}>
            <div className='flex flex-row gap-2 items-center'>
                {icon && <FontAwesomeIcon icon={icon}/>}{ title }
            </div>
        </button>
    );
};

export default CustomButton