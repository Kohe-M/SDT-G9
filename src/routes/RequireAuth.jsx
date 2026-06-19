import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { observeAuthState } from "../services/authService";

export default function RequireAuth() {
  const location = useLocation();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (!settled) {
        setUser(null);
      }
    }, 5000);

    const unsubscribe = observeAuthState(
      (nextUser) => {
        settled = true;
        window.clearTimeout(timeoutId);
        setUser(nextUser);
      },
      (error) => {
        settled = true;
        window.clearTimeout(timeoutId);
        console.error(error);
        setUser(null);
      },
    );

    return () => {
      window.clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  if (user === undefined) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        読み込み中...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
