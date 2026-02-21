import { NextResponse } from "next/server";

const API_URL = "https://honamihome.synology.me:4000/reply";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { clientIp, data } = body;

        // 메시지 상단에 IP 정보 추가
        if (data) {
            body.data = `                [${clientIp || "알 수 없음"}]\n${data}`;
        }

        // 시놀로지 서버로 보내기 전 불필요한 필드 정리 (선택 사항)
        delete body.clientIp;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃

        let response: Response;
        try {
            response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timeout);
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        const isTimeout = message.includes("abort") || message.includes("timed out");

        console.error("[/api/send] fetch failed:", message);

        return NextResponse.json(
            {
                success: false,
                error: isTimeout ? "서버 응답 시간 초과 (8s)" : message,
            },
            { status: 500 }
        );
    }
}
