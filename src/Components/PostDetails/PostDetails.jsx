import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PosrCard from '../PosrCard/PosrCard'
import Spinner from '../Spinner/Spinner'
import { Helmet } from 'react-helmet-async'

export default function PostDetails() {

 let {id}=  useParams()

 // لو المستخدم جاي من صفحة الإشعارات، بنعرض زرار "رجوع" بيرجّعه
 // لـ /notifications ويحافظ على نفس التاب (الكل / غير مقروء) اللي كان فاتحه
 const location = useLocation()
 const navigate = useNavigate()
 const cameFromNotifications = location.state?.fromNotifications

 

    function getPostDetails(){
      return  axios.get(`https://route-posts.routemisr.com/posts/${id}` , {
            headers:{
                Authorization :`Bearer ${localStorage.getItem('token')}`
            }
        })
    }


 const {data , isLoading , isError , error}=   useQuery({
        queryKey:['getSinglePost'  , id] ,
       queryFn : getPostDetails
    })

    console.log(data?.data.data.post);


    if(isLoading){
        return <Spinner/>
    }

       if(isError){
        return <div className='h-screen flex justify-center items-center'>
      <h2>{error.message}</h2>
    </div>
    }
    
  return (
    <>
      {cameFromNotifications && (
        <div className="max-w-xl mx-auto px-4 pt-3 mt-3">
           <Helmet>
                          <title>  Post Details | Eltaranisi Posts </title>
                      </Helmet>
          <button
            onClick={() =>
              navigate("/notifications", {
                state: { tab: location.state?.tab },
              })  
            }
            className=" flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all duration-200 active:scale-95  "
          >
            {/* أيقونة السهم (لو مستخدم Lucide React) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>

            <span>Back</span>
          </button>
        </div>
      )}
      <PosrCard isSinglePost={true} post={data?.data.data.post} />
    </>
  );
   
}
