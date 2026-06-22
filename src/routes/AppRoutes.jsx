import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import ChatListPage from "../pages/ChatListPage";
import ChatPage from "../pages/ChatPage";
import ClassSearchPage from "../pages/ClassSearchPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import MatchingPage from "../pages/MatchingPage";
import ProfilePage from "../pages/ProfilePage";
import TimetablePage from "../pages/TimetablePage";
import RequireAuth from "./RequireAuth";

// ルート定義をRouterから分離し、テストでMemoryRouterと組み合わせられるようにする
export function AppRoutesContent() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/classes/search" element={<ClassSearchPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chats" element={<ChatListPage />} />
          <Route path="/matching/:classCode" element={<MatchingPage />} />
          <Route path="/chat/:groupId" element={<ChatPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function AppRoutes() {
  return (
    <HashRouter>
      <AppRoutesContent />
    </HashRouter>
  );
}
