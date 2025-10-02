import { createUser } from "@/features/api/features/users/user.controller";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/error-handler";

// The route handler is the entry point. It only deals with HTTP.
export async function POST(req: NextRequest) {
  try {
    const newUser = await createUser(req);
    if (newUser instanceof Response) {
      return newUser;
    }
  
    return NextResponse.json({
      success: true,
      status: 201,
      message: "User created successfully",
      user: newUser
    })
  } catch (error) {
    console.error("Failed to create user:", error);
    return createErrorResponse(error);
  }
}
