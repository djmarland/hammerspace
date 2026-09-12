-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "PostTag" DROP CONSTRAINT "PostTag_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostTag" DROP CONSTRAINT "PostTag_tagId_fkey";

-- DropIndex
DROP INDEX "Post_authorId_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "authorId",
DROP COLUMN "excerpt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isAdmin";

-- DropTable
DROP TABLE "PostTag";

-- DropTable
DROP TABLE "Tag";
