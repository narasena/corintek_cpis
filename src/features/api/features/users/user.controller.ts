import { TUserAttributes } from "@/types/user.type";
import { NextRequest, NextResponse } from "next/server";
import { createUserService } from "./user.service";
import userSchema from "@/app/(main)/users/schemas/userSchema";
import z from "zod";

export async function createUser(req: NextRequest) {
  // Validate input
  let validatedData: TUserAttributes;
  try {
    const body: TUserAttributes = await req.json();
    validatedData = userSchema.parse(body);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }
    // Re-throw non-validation errors (e.g., JSON parse errors)
    throw error;
  }

  // Call service; let its errors bubble up
  const newUser = await createUserService(validatedData);
  return newUser;
}
