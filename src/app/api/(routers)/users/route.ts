import { fetchAllUsers } from "@/features/api/features/users/user.controller";
import { createErrorResponse } from "@/lib/error-handler";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest){
  try {
    const users = await fetchAllUsers()

    return NextResponse.json({
      success: true,
      status: 200,
      users
    })
  } catch (error) {
      console.error("Failed to fetch users:", error);
        return createErrorResponse(error);
  }
}