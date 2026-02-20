import { NextResponse } from "next/server";

const API_URL = "http://honamihome.iptime.org:7777/reply";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        return NextResponse.json(result);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
