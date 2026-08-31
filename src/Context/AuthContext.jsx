import axios from "axios";
import { createContext, useEffect, useState } from "react";

export let AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [userToken, setuserToken] = useState(null);
  const [userData, setuserData] = useState(null);

  async function getUserData() {
    try {
      let { data } = await axios.get(
        "https://route-posts.routemisr.com/users/profile-data",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      console.log("FULL USER:", data.data.user);

      // صورة المستخدم القادمة من الـ API
      console.log("FULL USER PHOTO:", data.data.user?.photo);

      setuserData(data.data.user);
    } catch (error) {
      // التقاط خطأ 401 في حال انتهاء صلاحية التوكن أو عدم صحته
      if (error.response && error.response.status === 401) {
        console.warn("Session expired. Logging out...");

        // مسح التوكن التالف من المتصفح
        localStorage.removeItem("token");

        // تفريغ حالة المستخدم
        setuserToken(null);
        setuserData(null);

        // توجيه المستخدم إجبارياً إلى صفحة تسجيل الدخول
        // (تأكد أن "/login" هو المسار الصحيح لصفحة الدخول في مشروعك)
        window.location.href = "/login";
      } else {
        console.error("An error occurred while fetching user data:", error);
      }
    }
  }

  useEffect(() => {
    // did mount
    if (localStorage.getItem("token")) {
      setuserToken(localStorage.getItem("token"));
      getUserData();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userToken,
        setuserToken,
        userData,
        setuserData, // تمت الإضافة هنا
        getUserData, // تمت الإضافة هنا
      }}
    >
      {/* app */}
      {children}
    </AuthContext.Provider>
  );
}
