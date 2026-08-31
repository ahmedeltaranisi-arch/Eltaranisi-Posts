import React from 'react'
import Login from '../../Auth/Login/Login'
import { Navigate, useNavigate } from 'react-router-dom'

export default function ProtectRoute(props) {

    if(localStorage.getItem('token')){
        return props.children    // home , profile
    }
 else{
   return <Navigate to='/'/>

 }
}
