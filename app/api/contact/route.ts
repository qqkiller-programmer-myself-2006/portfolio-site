import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const getResend = () => new Resend(process.env.RESEND_API_KEY ?? "placeholder");
const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    const resend = getResend();
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: process.env.NOTIFY_EMAIL!,
      subject: `📩 Portfolio Contact: ${data.name}`,
      html: `<div style="font-family:sans-serif;padding:24px;background:#f8fafc;border-radius:12px;">
        <h2 style="color:#6366f1;">ข้อความจาก Portfolio</h2>
        <p><strong>ชื่อ:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>ข้อความ:</strong></p>
        <div style="background:#fff;padding:12px;border-radius:8px;border:1px solid #e2e8f0;margin-top:8px;white-space:pre-wrap;">${data.message}</div>
      </div>`,
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
