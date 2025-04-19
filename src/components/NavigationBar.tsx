import IMAGE from "../constant/IMAGES"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons"

import { Tooltip } from 'react-tooltip'

const NavigationBar = () => {
    return (
        <div className="w-full h-16 bg-uc-primary flex flex-row px-4 py-2 justify-between">
            <div className="flex flex-row gap-5 items-center">
                <img src={IMAGE.UCGatorLogo} alt="ucgator_logo.png" className="w-18" />
            </div>
            <div className="flex justify-center items-center">
                <h1 className="text-xl font-semibold tracking-wider text-white">UCGATOR ADMIN</h1>
            </div>
            <div className="relative flex flex-row justify-center items-center group">
                <FontAwesomeIcon icon={faInfoCircle} color="white" className="text-xl" data-tooltip-id="my-tooltip" data-tooltip-content="Auto save has yet to be implemented. Please proceed with caution."/>
                <Tooltip id="my-tooltip"/>
            </div>
        </div>
    )
}

export default NavigationBar