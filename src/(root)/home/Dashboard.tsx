import IMAGE from '../../constant/IMAGES';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { IUserData } from '@/data/types';

const Dashboard = () => {
  const authUser = useAuthUser<IUserData>();
  return (
    <div className='w-full'>
      <div className='h-[150px] p-5 bg-uc-blue flex flex-row'>
        <img src={IMAGE.BannerPlane} alt="banner_plane.png" className='size-28'/>
        <div className='text-white gap-1 flex flex-col mx-5'>
          <h1 className='text-5xl font-bold'>Hello {authUser?.profile.firstName}!</h1>
          <h3 className='text-xl'>Welcome back to your dashboard.</h3>
          <h3 className='text-xl'>Use this section to enhance UCnian experience around the campus.</h3>
        </div>
      </div>
    </div>
  )
}

export default Dashboard