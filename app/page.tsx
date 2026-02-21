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
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      // 3개 이상이면 가장 오래된 것 제거
      if (next.length > 3) {
        return next.slice(1);
      }
      return next;
    });
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
      // ipify를 사용하여 클라이언트 IP 가져오기
      let clientIp = "알 수 없음";
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        clientIp = ipData.ip;
      } catch (e) {
        console.error("IP 획득 실패:", e);
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: ROOM_ID,
          type: "text",
          data: ART_DATA,
          clientIp: clientIp // 서버로 IP 전달
        }),
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
      {/* 토스트 알림 */}
      <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-50 w-[90%] max-w-[380px] pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold backdrop-blur-2xl shadow-2xl w-full border animate-in fade-in slide-in-from-top-4 duration-300 ${t.type === "success" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300" :
              t.type === "error" ? "bg-red-500/15 border-red-500/30 text-red-300" :
                "bg-brand-purple/15 border-brand-purple/30 text-purple-200"
              }`}
            onClick={() => removeToast(t.id)}
          >
            {t.type === "loading" ? (
              <div className="w-4 h-4 border-2 border-purple-300/30 border-t-purple-300 rounded-full animate-spin" />
            ) : (
              <span className="text-lg">{t.type === "success" ? "✅" : "❌"}</span>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      <main className="flex flex-col items-center justify-center h-[100dvh] gap-8 md:gap-12 px-6 overflow-hidden">
        {/* 제목 영역 */}
        <div className="text-center transition-all duration-700 animate-in fade-in zoom-in-95">
          {/* <p className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase text-purple-400 mb-2 opacity-80">
            Dick Payload System
          </p> */}
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none drop-shadow-[0_0_15px_rgba(81,0,255,0.3)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-purple to-purple-400">야추</span> 발사기
          </h1>
        </div>

        {/* 버튼 영역 */}
        <div className="relative group">
          {/* 배후 글로우 효과 (필터 잔상 문제를 방지하기 위한 별도 레이어) */}
          <div className="absolute inset-[-20%] bg-brand-purple/20 blur-[60px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse pointer-events-none" />

          <button
            className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center transition-all duration-150 active:scale-90 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed outline-none select-none tap-highlight-transparent"
            onClick={sendTheArt}
            disabled={loading || cooldownLeft > 0}
            aria-label="야추 전송"
          >
            <Image
              src="/button.png"
              alt="전송하기"
              width={256}
              height={256}
              className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(81,0,255,0.4)] transition-all group-hover:drop-shadow-[0_0_35px_rgba(81,0,255,0.6)]"
              priority
            />

            {/* 쿨다운 히든 레이어 */}
            {cooldownLeft > 0 && (
              <div className="absolute inset-0 z-20 rounded-full bg-brand-bg-end/80 backdrop-blur-md border border-red-500/20 flex flex-col items-center justify-center gap-1 animate-in fade-in duration-300">
                <span className="text-2xl md:text-3xl">🚫</span>
                <span className="text-xl md:text-2xl font-black text-red-300 tracking-tight">
                  {cooldownLeft}초
                </span>
              </div>
            )}
          </button>
        </div>
      </main>
    </>
  );
}
