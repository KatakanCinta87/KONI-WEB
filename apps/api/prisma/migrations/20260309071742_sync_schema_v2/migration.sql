-- AlterTable
ALTER TABLE "News" ADD COLUMN     "caborId" TEXT;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_caborId_fkey" FOREIGN KEY ("caborId") REFERENCES "CabangOlahraga"("id") ON DELETE SET NULL ON UPDATE CASCADE;
