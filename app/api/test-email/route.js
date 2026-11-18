import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'photosurfbud@gmail.com',
      subject: 'PocketMountz — Email Test',
      html: '<h2>It works.</h2><p>Resend is connected to PocketMountz. Email verification for auctions is ready to build.</p>',
    });

    if (error) return Response.json({ error }, { status: 400 });
    return Response.json({ success: true, id: data.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
