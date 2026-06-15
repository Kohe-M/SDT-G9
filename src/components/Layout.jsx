import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import BottomTabBar from "./BottomTabBar";

const HIDE_CHROME_ON = ["/login"];
const HIDE_TABS_ON  = ["/login", "/chat/"];

export default function Layout() {
  const location = useLocation();
  const hideChrome = HIDE_CHROME_ON.some((p) => location.pathname.startsWith(p));
  const showTabs   = !HIDE_TABS_ON.some((p) => location.pathname.startsWith(p));

  return (
    <>
      {!hideChrome && <Header />}
      <main style={{ paddingBottom: showTabs ? 80 : 0 }}>
        <Outlet />
      </main>
      <BottomTabBar />
    </>
  );
}
