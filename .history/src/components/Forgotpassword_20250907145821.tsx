import React, { useState } from "react";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    // Temporarily show support message
    setTimeout(() => {
      setLoading(false);
      setMessage(
        "Password reset functionality will be implemented soon. Please contact support."
      );
    }, 1000);
  };

  return (
    <div
      className="forgot-password-container"
      style={{ maxWidth: 400, margin: "0 auto", padding: "2rem" }}
    >
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.25rem" }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: "0.5rem 1rem" }}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
      {message && (
        <p style={{ color: "green", marginTop: "1rem" }}>{message}</p>
      )}
      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
    </div>
  );
};

export default ForgotPassword;
