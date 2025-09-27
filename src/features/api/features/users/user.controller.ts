import { TUserCreationAttributes } from "@/types/user.type";
import { NextRequest, NextResponse } from "next/server";
import { createUserWithoutAvatar, updateUserAvatar } from "./user.service";
import {userCreationSchema} from "@/app/(main)/users/schemas/userSchema";
import z from "zod";
import { prisma } from "../../connection/prisma";

export async function createUser(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
    console.log('FormData keys:', Array.from(formData.keys())); // Log for validation
    console.log('Full FormData entries:', Array.from(formData.entries()).map(([k, v]) => `${k}: ${v instanceof File ? `File(${v.name}, ${v.size} bytes)` : v}`));
  } catch (error) {
    console.error('FormData parse error:', error);
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  // Extract fields to object
  const data: Partial<Omit<TUserCreationAttributes, 'avatarImg'>> = {};
  const avatarImg = formData.get('avatarImg') as File | null;
  console.log('Parsed avatarImg:', avatarImg instanceof File ? `${avatarImg.name} (${avatarImg.size} bytes)` : 'Null/No file'); // Log for validation
  console.log('Full FormData entries:', Array.from(formData.entries()).map(([k, v]) => `${k}: ${v instanceof File ? `File(${v.name}, ${v.size} bytes)` : v}`));

  for (const [key, value] of formData.entries()) {
    if (key !== 'avatarImg' && value !== null) {
      const fieldKey = key as keyof Omit<TUserCreationAttributes, 'avatarImg'>;
      if (fieldKey === 'role' || fieldKey === 'employmentStatus') {
        data[fieldKey] = value as any; // Enums as strings
      } else {
        (data as any)[fieldKey] = value as string;
      }
    }
  }

  console.log('Extracted data before Zod:', data); // Log for validation

  // Validate non-file fields
  const schemaWithoutFile = userCreationSchema.omit({ avatarImg: true });
  let validatedData: z.infer<typeof schemaWithoutFile>;
  try {
    validatedData = schemaWithoutFile.parse(data);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }
    throw error;
  }

  console.log('Validated non-file data:', validatedData);

  // Create user first without avatar in transaction
  let newUser;
  let avatarUrl: string | null = null;
  let avatarPublicId: string | null = null;
  try {
    await prisma.$transaction(async (tx) => {
      newUser = await createUserWithoutAvatar(validatedData, tx);
      console.log('User created without avatar:', newUser);

      if (avatarImg && avatarImg.size > 0) {
        const timestamp = new Date().toISOString();
        const extension = avatarImg.name.split('.').pop() || 'jpg';
        const fileName = `avatar-${timestamp}-${newUser.id}`;
        const customKey = `avatars/users/${fileName}.${extension}`;

        const uploadFormData = new FormData();
        uploadFormData.append('file', avatarImg, avatarImg.name);
        uploadFormData.append('prefix', 'avatars/users');
        uploadFormData.append('key', customKey);

        // Fetch to your upload route (adjust baseURL if needed; assumes same origin)
        const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : `https://${process.env.VERCEL_URL}`;
        const uploadResponse = await fetch(`${baseUrl}/api/upload`, { // Full URL for server-side fetch
          method: 'POST',
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({})) as { error?: string };
          throw new Error(`Upload failed: ${errorData.error || 'Worker error'}`);
        }

        const uploadResult = await uploadResponse.json() as { url?: string; publicId?: string };
        avatarUrl = uploadResult.url || null;
        avatarPublicId = uploadResult.publicId || null;
        console.log('Uploaded avatar URL:', avatarUrl, 'Public ID:', avatarPublicId); // Log for validation

        // Update user with avatar in the same transaction
        await updateUserAvatar(newUser.id, avatarUrl!, avatarPublicId!, tx);
        console.log('User updated with avatar in transaction');
      }
    });
  } catch (error) {
    console.error('Transaction error:', error);
    return NextResponse.json({ error: 'User creation failed', details: error instanceof Error ? error.message : 'Unknown' }, { status: 500 });
  }

  console.log('Final user with avatar:', { id: newUser!.id, avatarUrl });

  return NextResponse.json({ message: 'User created successfully', data: newUser }, { status: 201 });
}