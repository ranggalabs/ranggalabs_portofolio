import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";

export async function GET() {
  const resume = await db.getResume();
  const fileName = resume.fileName || "CV_Rangga_Prasetya.pdf";

  // If uploaded to remote storage (e.g. Supabase Storage)
  if (resume.publicUrl && (resume.publicUrl.startsWith("http://") || resume.publicUrl.startsWith("https://"))) {
    try {
      const remoteRes = await fetch(resume.publicUrl);
      if (remoteRes.ok) {
        const arrayBuffer = await remoteRes.arrayBuffer();
        return new NextResponse(Buffer.from(arrayBuffer), {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${fileName}"`,
            "Cache-Control": "public, max-age=3600, must-revalidate",
          },
        });
      }
    } catch (e) {
      console.error("Error fetching remote cv.pdf:", e);
    }
  }

  const customPdfPath = path.join(process.cwd(), "data", "cv.pdf");

  try {
    if (fs.existsSync(customPdfPath)) {
      const buffer = fs.readFileSync(customPdfPath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${fileName}"`,
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      });
    }
  } catch (e) {
    console.error("Error reading custom cv.pdf:", e);
  }

  // Fallback valid minimal PDF binary representation
  const pdfContent = `%PDF-1.4
1 0 obj << /Title (CV - Rangga Prasetya) /Creator (Rangga Labs) >> endobj
2 0 obj << /Type /Catalog /Pages 3 0 R >> endobj
3 0 obj << /Type /Pages /Kids [4 0 R] /Count 1 >> endobj
4 0 obj << /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >> endobj
5 0 obj << /Length 260 >> stream
BT
/F1 20 Tf
50 720 Td
(Rangga Prasetya - Fullstack Developer) Tj
/F1 12 Tf
0 -30 Td
(Email: rangga.prasetya@example.com | Location: Bandung, Indonesia) Tj
0 -20 Td
(Specialties: React, Next.js, TypeScript, Go, PostgreSQL, ESP32, IoT) Tj
0 -40 Td
(Official Portfolio & Case Studies: https://ranggaprasetya.dev) Tj
ET
endstream
endobj
6 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000078 00000 n 
0000000125 00000 n 
0000000178 00000 n 
0000000301 00000 n 
0000000613 00000 n 
trailer << /Size 7 /Root 2 0 R >>
startxref
684
%%EOF`;

  return new NextResponse(pdfContent, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
