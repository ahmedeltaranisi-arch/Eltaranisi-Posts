import React, { useContext, useState } from "react";
import { Button } from "@heroui/react";
import { useForm } from "react-hook-form";
import { schema } from "../../schema/registerShema";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import {
  HiOutlineUser,
  HiOutlineAtSymbol,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineCalendar,
  HiOutlineUsers,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from "react-icons/hi2";

export default function Register() {
  let { setuserToken } = useContext(AuthContext);
  let navigate = useNavigate();

  const [apiError, setapiError] = useState(null);
  const [isLoading, setisLoading] = useState(false);

  // States للتحكم في ظهور كلمة السر وتأكيدها بشكل منفصل
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const { register, handleSubmit, formState } = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      rePassword: "",
      dateOfBirth: "",
      gender: "",
    },
    mode: "onSubmit",
    resolver: zodResolver(schema),
  });

  function submitForm(userData) {
    setisLoading(true);
    axios
      .post("https://route-posts.routemisr.com/users/signup", userData)
      .then((response) => {
        if (response.data.message === "account created") {
          setuserToken(response.data.data.token);
          localStorage.setItem("token", response.data.data.token);
          navigate("/");
        }
      })
      .catch((error) => {
        setapiError(error.response?.data?.message || "Something went wrong");
      })
      .finally(() => {
        setisLoading(false);
      });
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Create a new account
        </h2>
        <p className="text-sm text-gray-500 mt-1">It is quick and easy.</p>
      </div>

      <form onSubmit={handleSubmit(submitForm)} autoComplete="off">
        <div className="flex flex-col gap-3">
          {/* Full Name */}
          <div>
            <div className="relative flex items-center">
              <HiOutlineUser className="absolute left-3.5 text-xl text-gray-400 z-10 pointer-events-none" />
              <input
                {...register("name")}
                type="text"
                placeholder="Full name"
                autoComplete="off"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>
            {formState.errors.name && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.name?.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <div className="relative flex items-center">
              <HiOutlineAtSymbol className="absolute left-3.5 text-xl text-gray-400 z-10 pointer-events-none" />
              <input
                {...register("username")}
                type="text"
                placeholder="Username (optional)"
                autoComplete="off"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>
            {formState.errors.username && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.username?.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <div className="relative flex items-center">
              <HiOutlineEnvelope className="absolute left-3.5 text-xl text-gray-400 z-10 pointer-events-none" />
              <input
                {...register("email")}
                type="email"
                placeholder="Email address"
                autoComplete="off"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>
            {formState.errors.email && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.email?.message}
              </p>
            )}
          </div>

          {/* Gender */}
          <div>
            <div className="relative flex items-center">
              <HiOutlineUsers className="absolute left-3.5 text-xl text-gray-400 z-10 pointer-events-none" />
              <select
                {...register("gender")}
                defaultValue=""
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              >
                <option value="" disabled>
                  Select gender
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            {formState.errors.gender && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.gender?.message}
              </p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <div className="relative flex items-center">
              <HiOutlineCalendar className="absolute left-3.5 text-xl text-gray-400 z-10 pointer-events-none" />
              <input
                {...register("dateOfBirth")}
                type="date"
                autoComplete="off"
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
            {formState.errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.dateOfBirth?.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="relative flex items-center">
              <HiOutlineLockClosed className="absolute left-3.5 text-xl text-gray-400 z-10 pointer-events-none" />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="new-password"
                className="w-full pl-11 pr-11 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-xl text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
            {formState.errors.password && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.password?.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative flex items-center">
              <HiOutlineLockClosed className="absolute left-3.5 text-xl text-gray-400 z-10 pointer-events-none" />
              <input
                {...register("rePassword")}
                type={showRePassword ? "text" : "password"}
                placeholder="Confirm password"
                autoComplete="new-password"
                className="w-full pl-11 pr-11 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all placeholder:text-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowRePassword(!showRePassword)}
                className="absolute right-3.5 text-xl text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                aria-label={showRePassword ? "Hide password" : "Show password"}
              >
                {showRePassword ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
              </button>
            </div>
            {formState.errors.rePassword && (
              <p className="text-red-500 text-xs mt-1 px-1">
                {formState.errors.rePassword?.message}
              </p>
            )}
          </div>
        </div>

        {apiError && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-sm text-center py-2 my-3 rounded-xl">
            {apiError}
          </div>
        )}

        <Button
          type="submit"
          isDisabled={isLoading}
          className="mt-6 w-full bg-[#002984] text-white font-semibold py-3 rounded-xl hover:bg-blue-900 transition-all text-base"
        >
          {isLoading ? "Loading..." : "Create New Account"}
        </Button>
      </form>
    </div>
  );
}
