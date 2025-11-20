import { NextResponse } from "next/server"
import { postGameOfTheDayTweet } from "@/lib/social/postGameOfDayTweet"

export async function POST(request: Request) {
  const automationToken = process.env.SOCIAL_AUTOMATION_TOKEN
  if (automationToken) {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || authHeader !== `Bearer ${automationToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  try {
    const result = await postGameOfTheDayTweet()
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

