import { NavLink } from "react-router-dom";
import { ROUTES } from "../constants/routes";

const navItems = [
  { label: "ホーム", to: ROUTES.HOME },
  { label: "ログイン", to: ROUTES.LOGIN },
  { label: "プロフィール", to: ROUTES.PROFILE },
  { label: "時間割", to: ROUTES.TIMETABLE },
  { label: "授業検索", to: ROUTES.CLASS_SEARCH },
  { label: "マッチング確認", to: ROUTES.MATCHING_TEST },
  { label: "チャット確認", to: ROUTES.CHAT_TEST },
];

export default function Header() {
  return (
    <header>
      <nav aria-label="メインナビゲーション">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
