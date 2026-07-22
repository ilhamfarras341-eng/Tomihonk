import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { Role } from "@/lib/types";
import logo from "../assets/logo.png";

export default function Login() {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [role, setRole] = useState<Role>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Jika sudah login, redirect ke /
  useEffect(() => {
    if (currentUser) navigate("/", { replace: true });
  }, [currentUser, navigate]);


  const submit = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const ok = await login(u, p, role);
      if (ok) {
        navigate("/");
      } else {
        setError("Username, password, atau role tidak valid.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-overlay" />
      <div className="login-card">
        <div className="login-logo-wrap">
          <img src={logo} alt="Tomihonk" className="login-logo" />
        </div>
        <div className="login-header">
          <h1>Selamat Datang</h1>
          <p>Masuk untuk mengakses dashboard Anda</p>
        </div>
        <form onSubmit={submit} className="login-form">
          <div className="login-field">
            <label htmlFor="username">
              <i className="fas fa-user" /> Username
            </label>
            <input
              id="username"
              className="login-input"
              required
              maxLength={50}
              value={u}
              onChange={(e) => setU(e.target.value)}
              placeholder="Masukkan username"
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">
              <i className="fas fa-lock" /> Password
            </label>
            <div className="login-input-wrap">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="login-input"
                required
                maxLength={50}
                value={p}
                onChange={(e) => setP(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-eye"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="role">
              <i className="fas fa-id-badge" /> Login Sebagai
            </label>
            <select
              id="role"
              className="login-input"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              required
            >
              <option value="admin">Admin</option>
              <option value="teknisi">Teknisi</option>
              <option value="sales">Sales</option>
            </select>
          </div>

          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin" /> Memverifikasi...
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt" /> Masuk
              </>
            )}
          </button>
        </form>

        <button
          className="login-back"
          onClick={() => navigate("/")}
        >
          <i className="fas fa-arrow-left" /> Kembali ke Beranda
        </button>
      </div>
    </div>
  );
}
