import { HashRouter, Route, Routes } from "react-router-dom";
import Layout from "../components/Layout";
import ChatPage from "../pages/ChatPage";
import ClassSearchPage from "../pages/ClassSearchPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import MatchingPage from "../pages/MatchingPage";
import ProfilePage from "../pages/ProfilePage";
import TimetablePage from "../pages/TimetablePage";

export default function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/timetable" element={<TimetablePage />} />
          <Route path="/classes/search" element={<ClassSearchPage />} />
          <Route path="/matching/:classCode" element={<MatchingPage />} />
          <Route path="/chat/:groupId" element={<ChatPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
