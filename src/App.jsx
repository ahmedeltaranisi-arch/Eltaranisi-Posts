import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Components/Layout/Layout'
import AuthLayout from './Auth/AuthLayout/AuthLayout'
import Login from './Auth/Login/Login'
import Register from './Auth/Register/Register'
import Profile from './Components/Profile/Profile'
import Home from './Components/Home/Home'
import Notfound from './Components/Notfound/Notfound'
import { CounterContextProvider } from './Context/CounterContext'
import { AuthContextProvider } from './Context/AuthContext'
import { NotificationContextProvider } from './Context/NotificationContext'
import ProtectRoute from './Components/ProtectRoute/ProtectRoute'
import ProtectAuth from './Components/ProtectAuth/ProtectAuth'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import PostDetails from './Components/PostDetails/PostDetails'
import Notifications from './Components/Notifications/Notifications'
import { ToastContainer } from 'react-toastify'
import Settings from './settings/Settings';

const queryClient= new QueryClient()
function App() {

let route = createBrowserRouter([
  {
    path: "",
    element: (
      <ProtectAuth>
        <AuthLayout />
      </ProtectAuth>
    ),
    children: [
      { index: true, element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },

  {
    path: "",
    element: <Layout />,
    children: [
      {
        path: "profile",
        element: (
          <ProtectRoute>
            <Profile />
          </ProtectRoute>
        ),
      },
      {
        path: "home",
        element: (
          <ProtectRoute>
            <Home />
          </ProtectRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectRoute>
            {" "}
            <Settings />{" "}
          </ProtectRoute>
        ),
      },
      {
        path: "postDetails/:id",
        element: (
          <ProtectRoute>
            <PostDetails />
          </ProtectRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <ProtectRoute>
            <Notifications />
          </ProtectRoute>
        ),
      },

      { path: "*", element: <Notfound /> },
    ],
  },
]);
 

  return <>


<QueryClientProvider client={queryClient}>
  <AuthContextProvider>
  <NotificationContextProvider>
  <CounterContextProvider>
  <ToastContainer/>
  <RouterProvider router={route} />
  <ReactQueryDevtools/>
</CounterContextProvider>

</NotificationContextProvider>
</AuthContextProvider>
</QueryClientProvider>
  
  </>
}

export default App
