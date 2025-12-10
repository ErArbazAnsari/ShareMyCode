"use client"

import { NextResponse } from "next/server"
import { demoGists } from "@/lib/demo-data"

export async function GET() {
  try {
    return NextResponse.json(demoGists)
  } catch (error) {
    console.error("Error fetching demo gists:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
