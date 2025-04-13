// COLORS
import { COLORS } from "../../constant/COLORS";

// ICONS
import { faBuilding, faPencil } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

const Campus = () => {
  return (
    <div className='w-full h-dvh'>
      <div className='p-5'>
        <h1 className='text-xl font-bold tracking-wider'>Campus Map</h1>
      </div>
      <div className="w-full">
        <div>
          <Link to={'/canvas'}>
            Edit
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Campus