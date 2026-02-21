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
          height: 100vh;
          height: 100dvh;
          overflow: hidden; /* 스크롤 방지 */
        }

        .page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          height: 100dvh;
          gap: clamp(20px, 5vh, 48px);
          padding: 20px;
          text-align: center;
        }

        /* ── 제목 영역 ── */
        .title-block {
          width: 100%;
        }
        .title-label {
          font-size: clamp(10px, 2vw, 12px);
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #9b72ff;
          margin-bottom: 6px;
        }
        .title-main {
          font-size: clamp(28px, 8vw, 44px);
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1.1;
          text-shadow: 0 0 30px rgba(81,0,255,0.5), 0 0 60px rgba(81,0,255,0.25);
        }
        .title-main span {
          background: linear-gradient(90deg, #5100ff, #a855f7);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── 버튼 ── */
        .btn-wrap {
          position: relative;
          display: inline-block;
          width: clamp(160px, 50vw, 240px);
          height: clamp(160px, 50vw, 240px);
        }
        .btn-wrap::before {
          content: '';
          position: absolute;
          inset: -10%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(81,0,255,0.3) 0%, transparent 70%);
          filter: blur(12px);
          transition: opacity 0.3s;
          opacity: 0.6;
        }
        .btn-wrap:hover::before { opacity: 1; }

        .send-btn {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1);
          outline: none;
          -webkit-tap-highlight-color: transparent; /* 모바일 터치 시 사각형 회색 배경 제거 */
        }
        .send-btn img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          /* 필터를 이미지에 직접 적용하여 버튼의 박스 경계선 영향을 받지 않도록 함 */
          filter: drop-shadow(0 0 20px rgba(81,0,255,0.5));
          transition: filter 0.2s, transform 0.2s;
        }
        .send-btn:hover img {
          filter: drop-shadow(0 0 30px rgba(81,0,255,0.8));
        }
        .send-btn:active { transform: scale(0.92); }
        .send-btn:disabled {
          cursor: not-allowed;
          filter: grayscale(0.5) opacity(0.7);
        }

        /* ── 쿨다운 오버레이 ── */
        .cooldown-overlay {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(5,0,16,0.8);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          border: 1.5px solid rgba(252,165,165,0.2);
          gap: 2px;
          pointer-events: none;
          z-index: 10;
        }
        .cooldown-emoji { font-size: clamp(20px, 5vw, 28px); }
        .cooldown-text { 
          font-size: clamp(18px, 4vw, 22px); 
          font-weight: 800; 
          color: #fca5a5; 
          letter-spacing: -0.01em; 
        }

        /* ── 토스트 컨테이너 ── */
        .toast-area {
          position: fixed;
          top: clamp(16px, 4vh, 24px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          z-index: 1000;
          width: 90%;
          max-width: 380px;
          pointer-events: none;
        }
        .toast {
          pointer-events: auto;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 600;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          width: 100%;
          animation: slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .toast-icon { font-size: 16px; flex-shrink: 0; }

        .toast.success {
          background: rgba(16,185,129,0.15);
          border: 1px solid rgba(16,185,129,0.3);
          color: #6ee7b7;
        }
        .toast.error {
          background: rgba(239,68,68,0.15);
          border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5;
        }
        .toast.loading {
          background: rgba(81,0,255,0.15);
          border: 1px solid rgba(81,0,255,0.3);
          color: #c4b5fd;
        }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(196,181,253,0.3);
          border-top-color: #c4b5fd;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
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
        <div className="btn-wrap">
          <button
            className="send-btn"
            onClick={sendTheArt}
            disabled={loading || cooldownLeft > 0}
            aria-label="야추 전송"
          >
            <Image
              src="/button.png"
              alt="전송하기"
              width={240}
              height={240}
              priority
            />
          </button>
          {cooldownLeft > 0 && (
            <div className="cooldown-overlay">
              <span className="cooldown-emoji">🚫</span>
              <span className="cooldown-text">{cooldownLeft}초</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
