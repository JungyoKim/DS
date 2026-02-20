"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const API_URL = "/api/send";
const ROOM_ID = "207021999140101";
const ART_DATA = `⠀⠀⠀⠀⠀⠀⠀⠀⣠⣶⣿⣿⣿⣷⣤⡀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣾⡿⠋⠀⠿⠇⠉⠻⣿⣄⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⢠⣿⠏⠀⠀⠀⠀⠀⠀⠀⠙⣿⣆⠀⠀⠀⠀⠀
⠀⠀⠀⠀⢠⣿⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣆⠀⠀⠀⠀
⠀⠀⠀⠀⢸⣿⡄⠀⠀⠀⢀⣤⣀⠀⠀⠀⠀⣿⡿⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠻⣿⣶⣶⣾⡿⠟⢿⣷⣶⣶⣿⡟⠁⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡏⠉⠁⠀⠀⠀⠀⠉⠉⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡇⠀⠀⣸⣿⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣿⡇⢀⣴⣿⠇⠀⠀⠀⠀⣿⡇⠀⠀⠀⠀⠀
⠀⠀⠀⢀⣠⣴⣿⣷⣿⠟⠁⠀⠀⠀⠀⠀⣿⣧⣄⡀⠀⠀⠀
⠀⢀⣴⡿⠛⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠙⢿⣷⣄⠀
⢠⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⣆
⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢹⣿
⣿⣇⠀⠀⠀⠀⠀⠀⢸⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿
⢹⣿⡄⠀⠀⠀⠀⠀⠀⢿⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⡿
⠀⠻⣿⣦⣀⠀⠀⠀⠀⠈⣿⣷⣄⡀⠀⠀⠀⠀⣀⣤⣾⡟⠁
⠀⠀⠈⠛⠿⣿⣷⣶⣾⡿⠿⠛⠻⢿⣿⣶⣾⣿⠿⠛⠉⠀⠀`;

type Toast = {
  id: number;
  message: string;
  type: "success" | "error" | "loading";
};

const RATE_LIMIT = 3;       // 최대 전송 횟수
const RATE_WINDOW = 1000;   // 1초
const COOLDOWN = 10000;     // 쿨다운 10초

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const sendTimestamps = useRef<number[]>([]);
  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  function addToast(message: string, type: Toast["type"]) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (type !== "loading") {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    }
    return id;
  }

  function removeToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function startCooldown() {
    let remaining = COOLDOWN / 1000;
    setCooldownLeft(remaining);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      remaining -= 1;
      setCooldownLeft(remaining);
      if (remaining <= 0 && cooldownTimer.current) {
        clearInterval(cooldownTimer.current);
        sendTimestamps.current = [];
      }
    }, 1000);
  }

  async function sendTheArt() {
    if (loading || cooldownLeft > 0) return;

    // Rate limiting
    const now = Date.now();
    sendTimestamps.current = sendTimestamps.current.filter(t => now - t < RATE_WINDOW);
    if (sendTimestamps.current.length >= RATE_LIMIT) {
      addToast(`🚫 잠깐! ${COOLDOWN / 1000}초 쿨다운`, "error");
      startCooldown();
      return;
    }
    sendTimestamps.current.push(now);
    setLoading(true);

    const loadingId = addToast("전송 중...", "loading");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room: ROOM_ID, type: "text", data: ART_DATA }),
      });
      const result = await response.json();

      removeToast(loadingId);

      if (result.success) {
        addToast("전송 성공! 🎯", "success");
      } else {
        throw new Error("서버 응답 실패");
      }
    } catch (err: unknown) {
      removeToast(loadingId);
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      addToast(`실패: ${message}`, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Noto Sans KR', sans-serif;
          background: radial-gradient(ellipse at center, #1a0050 0%, #0a0020 60%, #050010 100%);
          min-height: 100vh;
        }

        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 36px;
          padding: 24px;
        }

        /* ── 제목 영역 ── */
        .title-block {
          text-align: center;
        }
        .title-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #9b72ff;
          margin-bottom: 8px;
        }
        .title-main {
          font-size: 36px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1.1;
          text-shadow: 0 0 40px rgba(81,0,255,0.6), 0 0 80px rgba(81,0,255,0.3);
        }
        .title-main span {
          color: #7c3aed;
          background: linear-gradient(90deg, #5100ff, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── 버튼 ── */
        .btn-wrap {
          position: relative;
          display: inline-block;
        }
        .btn-wrap::before {
          content: '';
          position: absolute;
          inset: -12px;
          border-radius: 28px;
          background: radial-gradient(ellipse, rgba(81,0,255,0.35) 0%, transparent 70%);
          filter: blur(8px);
          transition: opacity 0.3s;
          opacity: 0;
        }
        .btn-wrap:hover::before { opacity: 1; }

        .send-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          border-radius: 20px;
          overflow: hidden;
          display: block;
          transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), filter 0.2s;
          filter: drop-shadow(0 0 18px rgba(81,0,255,0.5));
        }
        .send-btn:hover {
          transform: scale(1.06);
          filter: drop-shadow(0 0 28px rgba(81,0,255,0.8));
        }
        .send-btn:active { transform: scale(0.94); }
        .send-btn:disabled {
          cursor: not-allowed;
          opacity: 0.55;
          transform: scale(0.96);
        }


        /* ── 토스트 컨테이너 ── */
        .toast-area {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          z-index: 999;
          pointer-events: none;
        }
        .toast {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 600;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          min-width: 200px;
          animation: slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .toast-icon { font-size: 18px; flex-shrink: 0; }

        .toast.success {
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.35);
          color: #6ee7b7;
        }
        .toast.error {
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.35);
          color: #fca5a5;
        }
        .toast.loading {
          background: rgba(81,0,255,0.15);
          border: 1px solid rgba(81,0,255,0.35);
          color: #c4b5fd;
        }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(196,181,253,0.3);
          border-top-color: #c4b5fd;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* 토스트 알림 */}
      <div className="toast-area">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`} onClick={() => removeToast(t.id)}>
            {t.type === "loading" ? (
              <div className="spinner" />
            ) : (
              <span className="toast-icon">{t.type === "success" ? "✅" : "❌"}</span>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <div className="page">
        {/* 제목 */}
        <div className="title-block">
          <p className="title-label">Dick Payload System</p>
          <h1 className="title-main">
            <span>야추</span> 발사기
          </h1>
        </div>

        {/* 버튼 */}
        <div className="btn-wrap" style={{ position: "relative" }}>
          <button
            className="send-btn"
            onClick={sendTheArt}
            disabled={loading || cooldownLeft > 0}
            aria-label="야추 전송"
          >
            <Image
              src="/button.png"
              alt="전송하기"
              width={200}
              height={200}
              priority
            />
          </button>
          {cooldownLeft > 0 && (
            <div style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(5,0,16,0.75)",
              backdropFilter: "blur(8px)",
              border: "1.5px solid rgba(252,165,165,0.25)",
              gap: 4,
              pointerEvents: "none",
            }}>
              <span style={{ fontSize: 24 }}>🚫</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#fca5a5", letterSpacing: "-0.01em" }}>
                {cooldownLeft}초
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
