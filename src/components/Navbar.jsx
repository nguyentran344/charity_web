// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ currentAccount, walletConnected, connectWallet }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <svg
            className="navbar-logo-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          Quyên Góp Từ Thiện
        </Link>

        <div className="navbar-menu">
          {/* Chỉ hiện nút Tạo Dự Án khi đã kết nối ví */}
          {walletConnected && (
            <Link
              to="/create-project"
              className="navbar-link navbar-create-project"
            >
              Tạo Dự Án
            </Link>
          )}

          {/* Nút kết nối ví – luôn hiện */}
          <button
            onClick={connectWallet}
            className={`navbar-button navbar-wallet ${
              walletConnected ? "connected" : ""
            }`}
          >
            <svg
              className="navbar-icon"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
            </svg>
            {walletConnected ? (
              <>
                Ví: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}
              </>
            ) : (
              "Kết Nối MetaMask"
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
