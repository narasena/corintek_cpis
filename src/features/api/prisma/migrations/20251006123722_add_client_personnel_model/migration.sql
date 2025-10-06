-- CreateTable
CREATE TABLE "public"."client_personnel" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "personnelId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "client_personnel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_personnel_clientId_idx" ON "public"."client_personnel"("clientId");

-- CreateIndex
CREATE INDEX "client_personnel_personnelId_idx" ON "public"."client_personnel"("personnelId");

-- AddForeignKey
ALTER TABLE "public"."client_personnel" ADD CONSTRAINT "client_personnel_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."client_personnel" ADD CONSTRAINT "client_personnel_personnelId_fkey" FOREIGN KEY ("personnelId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
