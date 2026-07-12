import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuth2RedirectPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");
    const name = searchParams.get("name");

    if (token) {
      localStorage.setItem("token", token);
      if (role) localStorage.setItem("role", role);
      if (userId) localStorage.setItem("userId", userId);
      if (name) localStorage.setItem("name", name);

      const normalizedRole = role?.toUpperCase();

      if (normalizedRole === "EMPLOYEE" || normalizedRole === "INTERN") {
        navigate("/employee-dashboard", { replace: true });
      } else if (normalizedRole === "ADMIN" || normalizedRole === "HR") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/employee-dashboard", { replace: true });
      }
    } else {
      navigate("/login?error=oauth2", { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <p className="text-sm text-slate-500">Signing you in...</p>
    </div>
  );
}