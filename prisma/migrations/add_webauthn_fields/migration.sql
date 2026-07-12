-- AlterTable
ALTER TABLE "User" ADD COLUMN "webauthnChallenge" TEXT,
ADD COLUMN "webauthnChallengeExpiresAt" TIMESTAMP(3);
