import React, { useContext, useEffect, useRef, useState } from "react";
import Profile from "../Profile/Profile";
import Footer from "../Footer/Footer";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import PosrCard from "../PosrCard/PosrCard";
import Spinner from "../Spinner/Spinner";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import CreatePostCard from "../CreatePostCard/CreatePostCard";
import { Helmet } from "react-helmet-async";

const POSTS_PER_PAGE = 10;

const mockSuggestions = [
  {
    _id: "mock1",
    name: "Ahmed Abd Al-...",
    photo: "https://randomuser.me/api/portraits/men/32.jpg",
    followersCount: 276,
  },
  {
    _id: "mock2",
    name: "Alaa Ashraf",
    photo: "https://randomuser.me/api/portraits/women/44.jpg",
    followersCount: 213,
  },
  {
    _id: "mock3",
    name: "MrMo",
    photo: "https://randomuser.me/api/portraits/men/86.jpg",
    followersCount: 157,
  },
  {
    _id: "mock4",
    name: "menna",
    photo: "https://randomuser.me/api/portraits/women/68.jpg",
    followersCount: 126,
  },
];

export default function Home() {
  const SCROLL_KEY = "homeScrollY";
  const [searchFriend, setSearchFriend] = useState("");
  const [followedIds, setFollowedIds] = useState([]);

  const [activeTab, setActiveTab] = useState("feed");

  const toggleFollow = (userId) => {
    setFollowedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  useEffect(() => {
    let saveTimeout = null;
    function saveScrollPosition() {
      if (saveTimeout) return;
      saveTimeout = setTimeout(() => {
        sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
        saveTimeout = null;
      }, 150);
    }

    window.addEventListener("scroll", saveScrollPosition, { passive: true });
    window.addEventListener("beforeunload", saveScrollPosition);

    return () => {
      window.removeEventListener("scroll", saveScrollPosition);
      window.removeEventListener("beforeunload", saveScrollPosition);
      if (saveTimeout) clearTimeout(saveTimeout);
    };
  }, []);

  function getPostsPage({ pageParam = 1 }) {
    return axios.get("https://route-posts.routemisr.com/posts", {
      params: {
        sort: "-createdAt",
        page: pageParam,
        limit: POSTS_PER_PAGE,
      },
      headers: {
        Authorization: ` Bearer ${localStorage.getItem("token")}`,
      },
    });
  }

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isError: isPostsError,
    error: postsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["getPost"],
    queryFn: getPostsPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const postsInLastPage = lastPage?.data?.data?.posts?.length || 0;
      if (postsInLastPage < POSTS_PER_PAGE) return undefined;
      return allPages.length + 1;
    },
  });

  const allPosts =
    postsData?.pages.flatMap((page) => page?.data?.data?.posts || []) || [];

  function getSuggestions() {
    return axios.get(
      "https://route-posts.routemisr.com/users/suggestions?limit=10",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
  }

  const { data: suggestionsData, isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ["getSuggestions"],
    queryFn: getSuggestions,
  });

  const responseData = suggestionsData?.data;
  let suggestedUsers = [];

  if (Array.isArray(responseData?.users)) {
    suggestedUsers = responseData.users;
  } else if (Array.isArray(responseData?.data)) {
    suggestedUsers = responseData.data;
  } else if (Array.isArray(responseData)) {
    suggestedUsers = responseData;
  }

  if (!isSuggestionsLoading && suggestedUsers.length === 0) {
    suggestedUsers = mockSuggestions;
  }

  const filteredUsers = suggestedUsers.filter((user) =>
    user?.name?.toLowerCase().includes(searchFriend.toLowerCase()),
  );

  // 🟢 تعديل الـ Scroll عشان يشتغل في الـ Feed والـ Community
  useEffect(() => {
    if (
      !isPostsLoading &&
      postsData &&
      (activeTab === "feed" || activeTab === "community")
    ) {
      const savedY = sessionStorage.getItem(SCROLL_KEY);
      if (savedY) {
        requestAnimationFrame(() => {
          window.scrollTo(0, Number(savedY));
        });
      }
    }
  }, [isPostsLoading, postsData, activeTab]);

  const sentinelRef = useRef(null);

  // 🟢 تعديل الـ Observer عشان يشتغل في الـ Feed والـ Community
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || (activeTab !== "feed" && activeTab !== "community")) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, activeTab]);

  if (isPostsLoading) {
    return <Spinner />;
  }

  if (isPostsError) {
    return (
      <div className="h-screen flex justify-center items-center">
        <h2>{postsError.message}</h2>
      </div>
    );
  }

  const getTabClass = (tabName) => {
    const baseClass =
      "flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer";
    const activeClass = "bg-[#eff5ff] text-[#1b64da]";
    const inactiveClass = "text-[#3b4758] hover:bg-gray-50";
    return `${baseClass} ${activeTab === tabName ? activeClass : inactiveClass}`;
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 relative justify-center">
      <Helmet>
        <title> Home | Eltaranisi Posts </title>
      </Helmet>

      {/* ----------------- القائمة الجانبية اليسرى ----------------- */}
      <aside className="hidden lg:block w-64 shrink-0 self-start sticky top-24">
        <div className="bg-white rounded-3xl p-3 shadow-sm border border-gray-100 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("feed")}
            className={getTabClass("feed")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            Feed
          </button>
          <button
            onClick={() => setActiveTab("myPosts")}
            className={getTabClass("myPosts")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
            My Posts
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={getTabClass("community")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Community
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={getTabClass("saved")}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            Saved
          </button>
        </div>
      </aside>

      {/* ----------------- المحتوى الرئيسي ----------------- */}
      <main className="flex-1 w-full max-w-2xl flex flex-col">
        {/* 🟢 عرض الـ Feed أو الـ Community معاً */}
        {(activeTab === "feed" || activeTab === "community") && (
          <>
            <CreatePostCard />
            {allPosts.map((post) => (
              <PosrCard
                isSinglePost={false}
                key={post._id}
                post={post}
                queryKey="getPost"
              />
            ))}
            <div ref={sentinelRef} className="h-1" />
            {isFetchingNextPage && (
              <div className="py-4 flex justify-center">
                <Spinner />
              </div>
            )}
            {!hasNextPage && allPosts.length > 0 && (
              <p className="text-center text-gray-400 text-sm py-6">
                مفيش بوستات تانية دلوقتي
              </p>
            )}
          </>
        )}

        {/* 🟢 عرض My Posts أو Saved معاً (كلاهما يعرض كومبوننت Profile) */}
        {(activeTab === "myPosts" || activeTab === "saved") && <Profile />}
      </main>

      {/* ----------------- القائمة الجانبية اليمنى ----------------- */}
      <aside className="hidden xl:block w-80 shrink-0 self-start sticky top-24">
        <div className="bg-white rounded-[1.25rem] shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100/80 flex flex-col min-h-[12rem] max-h-[calc(100vh-8rem)]">
          <div className="p-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-[#0f172a]">
              <svg
                className="w-5 h-5 text-[#1b64da]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <h2 className="font-bold text-[15px]">Suggested Friends</h2>
            </div>
            <span className="bg-[#f1f5f9] text-[#475569] text-xs font-semibold w-[22px] h-[22px] rounded-full flex items-center justify-center">
              {isSuggestionsLoading ? "-" : filteredUsers.length}
            </span>
          </div>

          <div className="px-5 pb-4">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search friends..."
                value={searchFriend}
                onChange={(e) => setSearchFriend(e.target.value)}
                className="w-full bg-transparent border border-gray-200/80 text-[13px] rounded-xl py-2 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-[#94a3b8]"
              />
            </div>
          </div>

          <div className="px-5 pb-5 overflow-y-auto custom-scrollbar flex flex-col gap-3 flex-1">
            {isSuggestionsLoading ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const isFollowing = followedIds.includes(user._id);
                return (
                  <div
                    key={user._id}
                    className="p-3 border border-gray-100 rounded-2xl flex items-center justify-between gap-3 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          user.photo ||
                          user.profilePic ||
                          `https://ui-avatars.com/api/?name=${user.name}&background=random`
                        }
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover shrink-0 bg-gray-50"
                      />
                      <div className="min-w-0 flex flex-col items-start">
                        <p className="font-bold text-[13px] text-gray-900 truncate w-full">
                          {user.name}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate w-full">
                          @
                          {user.name
                            ?.toLowerCase()
                            .replace(/\s+/g, "")
                            .substring(0, 10)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFollow(user._id)}
                      className={`shrink-0 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-full text-xs font-bold ${isFollowing ? "bg-gray-100 text-gray-600 hover:bg-gray-200" : "bg-[#eff5ff] text-[#1b64da] hover:bg-blue-100"}`}
                    >
                      {isFollowing ? (
                        <>
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Following
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            />
                          </svg>
                          Follow
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-[13px] font-medium text-[#94a3b8]">
                  No suggestions found.
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
