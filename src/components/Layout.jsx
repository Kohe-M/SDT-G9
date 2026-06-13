import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomTabBar from "./BottomTabBar";

const HIDE_TABS_ON = ["/login", "/chat/"];

export default function Layout() {
  const location = useLocation();
  const showTabs = !HIDE_TABS_ON.some((p) => location.pathname.startsWith(p));

  return (
    <>
      <Header />
      <main style={{ paddingBottom: showTabs ? 80 : 0 }}>
        <Outlet />
      </main>
      <BottomTabBar />
    </>
  );
}
