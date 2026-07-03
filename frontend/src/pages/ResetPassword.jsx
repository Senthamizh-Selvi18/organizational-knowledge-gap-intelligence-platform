import { useState } from "react";
import { resetPassword } from "../api/authApi";

function ResetPassword() {
  const token = new URLSearchParams(window.location.search).get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const data = await resetPassword(token, newPassword);
      setStatus("done");
      setMessage(data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  if (!token) {
    return (
      <section className="auth-form">
        <h1>Reset Password</h1>
        <p className="form-message error">
          This reset link is missing a token. Please use the link from your email.
        </p>
      </section>
    );
  }

  return (
    <section className="auth-form">
      <h1>Reset Password</h1>

      {status === "done" ? (
        <p className="form-message success">{message}</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />

          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />

          <button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Resetting..." : "Reset password"}
          </button>

          {status === "error" && <p className="form-message error">{message}</p>}
        </form>
      )}
    </section>
  );
}

export default ResetPassword;
