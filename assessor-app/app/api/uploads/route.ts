import { NextResponse } from "next/server"
import { listUploadRecords } from "@/lib/uploads"

export async function GET() {
  if (!process.env.DYNAMODB_UPLOADS_TABLE_NAME) {
    return NextResponse.json({ records: [] })
  }

  try {
    const records = await listUploadRecords()
    return NextResponse.json({ records })
  } catch (error) {
    console.error("Failed to list uploads:", error)
    return NextResponse.json(
      { error: "Failed to retrieve uploads" },
      { status: 500 }
    )
  }
}
