import { useState } from "react";
import { forgotPassword } from "../api/authApi";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); 
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const data = await forgotPassword(email);
      setStatus("done");
      setMessage(data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    }
  };

  return (
    <section className="auth-form">
      <h1>Forgot Password</h1>
      <p>Enter your account email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@company.com"
        />

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Sending..." : "Send reset link"}
        </button>
      </form>

      {message && (
        <p className={status === "error" ? "form-message error" : "form-message success"}>
          {message}
        </p>
      )}
    </section>
  );
}

export default ForgotPassword;
