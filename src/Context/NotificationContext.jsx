import { createContext, useContext } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

const BASE_URL = "https://route-posts.routemisr.com";
const LOCAL_STORAGE_KEY = "read_notifications_ids";

export function NotificationContextProvider({ children }) {
  const { userToken } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const getHeaders = () => {
    const token = userToken || localStorage.getItem("token");
    return {
      token: token,
      Authorization: `Bearer ${token}`,
    };
  };

  // دالة لجلب الـ IDs المقروءة من الـ LocalStorage
  const getLocalReadIds = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // دالة لحفظ ID مقروء جديد في الـ LocalStorage
  const saveLocalReadId = (id) => {
    const current = getLocalReadIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
    }
  };

  // دالة لحفظ كل الـ IDs في الـ LocalStorage (عند الضغط على تعليم الكل)
  const saveAllLocalReadIds = (notificationsList) => {
    const allIds = notificationsList.map((n) => n._id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allIds));
  };

  // 1. جلب الإشعارات من السيرفر ودمجها مع حالة الـ LocalStorage
  async function getNotifications() {
    try {
      const response = await axios.get(
        `${BASE_URL}/notifications?unread=false&page=1&limit=50`,
        {
          headers: getHeaders(),
        },
      );

      // دمج الإشعارات القادمة من السيرفر مع الـ LocalStorage المحفوظ محلياً
      const localReadIds = getLocalReadIds();
      if (response?.data?.data?.notifications) {
        response.data.data.notifications = response.data.data.notifications.map(
          (n) => {
            if (localReadIds.includes(n._id)) {
              return { ...n, isRead: true };
            }
            return n;
          },
        );
      }

      return response;
    } catch (error) {
      console.log("❌ Fetch Error:", error.response?.data || error.message);
      throw error;
    }
  }

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["getNotifications"],
    queryFn: getNotifications,
    enabled: !!userToken,
    refetchOnWindowFocus: false,
  });

  const notifications = data?.data?.data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // 2. تعليم إشعار واحد كمقروء وتخزينه في LocalStorage
  const markOneAsRead = (notificationId) => {
    saveLocalReadId(notificationId); // حفظ محلياً عشان ميطيرش مع الـ Refresh

    queryClient.setQueryData(["getNotifications"], (old) => {
      if (!old) return old;
      return {
        ...old,
        data: {
          ...old.data,
          data: {
            ...old.data.data,
            notifications: old.data.data.notifications.map((n) =>
              n._id === notificationId ? { ...n, isRead: true } : n,
            ),
          },
        },
      };
    });
    toast.success("Notification marked as read");
  };

  // 3. تعليم كل الإشعارات كمقروءة (مع السيرفر والـ LocalStorage)
  function markAllAsReadRequest() {
    saveAllLocalReadIds(notifications); // حفظ الكل محلياً
    return axios.put(
      `${BASE_URL}/notifications/read-all`,
      {},
      {
        headers: getHeaders(),
      },
    );
  }

  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMutation({
    mutationFn: markAllAsReadRequest,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["getNotifications"] });
      const previous = queryClient.getQueryData(["getNotifications"]);

      queryClient.setQueryData(["getNotifications"], (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: {
              ...old.data,
              notifications: old.data.data.notifications.map((n) => ({
                ...n,
                isRead: true,
              })),
            },
          },
        };
      });

      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["getNotifications"], context.previous);
      }
      toast.error("Error marking all notifications as read. Please try again.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["getNotifications"] });
    },
  });

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isError,
        error,
        markOneAsRead,
        isMarkingOne: false,
        markAllAsRead,
        isMarkingAll,
        refetchNotifications: refetch,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
