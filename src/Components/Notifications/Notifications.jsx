import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { NotificationContext } from "../../Context/NotificationContext";
import Spinner from "../Spinner/Spinner";
import { Helmet } from "react-helmet-async";

function notificationText(n) {
  switch (n.type) {
    case "comment_post":
      return "commented on your post";
    case "like_post":
      return "liked your post";
    case "share_post":
      return "shared your post";
    case "follow":
      return "started following you";
    default:
      return n.type;
  }
}

function timeAgo(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d`;
}

function getNotificationIcon(type) {
  if (type === "like_post") {
    return (
      <svg
        className="w-4 h-4 text-red-500"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    );
  }
  return (
    <svg
      className="w-4 h-4 text-blue-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

export default function Notifications() {
  const {
    notifications,
    isLoading,
    isError,
    error,
    markOneAsRead,
    markAllAsRead,
    isMarkingAll,
  } = useContext(NotificationContext);

  const location = useLocation();
  const navigate = useNavigate();

  // الحفاظ على الـ tab القادم من الـ location state أو الافتراضي "all"
  const [tab, setTab] = useState(location.state?.tab || "all");

  const unread = notifications.filter((n) => !n.isRead);
  const list = tab === "all" ? notifications : unread;

  // الدالة بعد التعديل لحل مشكلة الضغط
  function handleNotificationClick(n) {
    if (!n.isRead) {
      markOneAsRead(n._id);
    }

    // استخراج ID المنشور، بناءً على بياناتك هو غالباً داخل n.entity._id
    const postId =
      n.entity?._id ||
      n.entityId ||
      n.post?._id ||
      n.post ||
      (typeof n.entity === "string" ? n.entity : null);

    // التحقق هل الإشعار يخص منشوراً (لايك، كومنت، شير)
    const isPostRelated =
      n.type === "comment_post" ||
      n.type === "like_post" ||
      n.type === "share_post" ||
      n.entityType === "post";

    // لو كان الإشعار لمنشور وموجود ID، يتم التوجيه
    if (isPostRelated && postId) {
      navigate(`/postDetails/${postId}`, {
        state: { fromNotifications: true, tab },
      });
    } else {
      console.warn("Cannot navigate: No Post ID found", n);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Helmet>
                <title>  Notification | Eltaranisi Posts </title>
            </Helmet>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-[#0b1427]">Notifications</h1>
        <button
          onClick={() => markAllAsRead()}
          disabled={isMarkingAll || unread.length === 0}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ✓ Mark all as read
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Realtime updates for likes, comments, shares, and follows.
      </p>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b pb-4">
        <button
          onClick={() => setTab("all")}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
            tab === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setTab("unread")}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
            tab === "unread"
              ? "bg-blue-50 text-blue-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Unread
          {unread.length > 0 && (
            <span
              className={`text-xs rounded-full px-2 py-0.5 ${
                tab === "unread"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600 border border-blue-200"
              }`}
            >
              {unread.length}
            </span>
          )}
        </button>
      </div>

      {isLoading && (
        <div className="py-16 flex justify-center">
          <Spinner />
        </div>
      )}

      {isError && (
        <div className="text-center py-16 text-red-500">
          {error?.message || "Error loading notifications"}
        </div>
      )}

      {!isLoading && !isError && list.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          {tab === "all" ? "No notifications yet" : "No unread notifications"}
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-4">
        {list.map((n) => (
          <div
            key={n._id}
            onClick={() => handleNotificationClick(n)}
            className={`flex items-start gap-4 border rounded-xl p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
              n.isRead
                ? "bg-white border-gray-100"
                : "bg-[#f4f7ff] border-blue-100"
            }`}
          >
            <img
              src={n.actor?.photo || "https://via.placeholder.com/150"}
              alt={n.actor?.name || "User"}
              className="w-12 h-12 rounded-full object-cover shrink-0"
            />

            <div className="flex-1 min-w-0">
              <p className="text-[15px] text-gray-900 mb-1">
                <span className="font-bold">{n.actor?.name || "Someone"}</span>{" "}
                {notificationText(n)}
              </p>
              {n.entity?.body && (
                <p className="text-[15px] text-gray-500 truncate mb-2">
                  {n.entity.body}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2">
                {getNotificationIcon(n.type)}
                {!n.isRead ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markOneAsRead(n._id);
                    }}
                    className="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline"
                  >
                    ✓ Mark as read
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-[#10b981] flex items-center gap-1">
                    ✓ Read
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-sm text-gray-400 shrink-0">
              <span>{timeAgo(n.createdAt)}</span>
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-2"></span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
