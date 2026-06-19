import { createClient } from "https://esm.sh/@insforge/sdk@latest";

const RECOVERY_SECRET = "MG_recovery_s3cret_2026!";
const APP_URL = Deno.env.get("APP_URL") || "http://localhost:5173";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

export default async function handler(request: Request): Promise<Response> {
  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      },
    });
  }

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Create InsForge admin client using service role
    const insforge = createClient({
      baseUrl: Deno.env.get("INSFORGE_URL") || "",
      anonKey: Deno.env.get("INSFORGE_ANON_KEY") || "",
    });

    // Call our custom RPC to generate a recovery token
    const { data: token, error: rpcError } = await insforge.database.rpc(
      "request_recovery_token",
      { p_email: email, p_secret: RECOVERY_SECRET }
    );

    // Always return success to avoid email enumeration attacks
    if (rpcError || !token) {
      return new Response(
        JSON.stringify({
          message: "Si el correo está registrado, recibirás un enlace de recuperación.",
        }),
        { status: 200, headers: corsHeaders() }
      );
    }

    const recoveryLink = `${APP_URL}/reset-password?token=${token}`;

    // Try to send email via Resend if API key is configured
    if (RESEND_API_KEY) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "MotoGestor <noreply@motogestor.com>",
            to: [email],
            subject: "🔑 Recupera tu contraseña - MotoGestor",
            html: `
              <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0d0f14; color: #e0e0e0;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="color: #00d4aa; font-size: 28px; margin: 0;">🏍️ MotoGestor</h1>
                  <p style="color: #888; font-size: 14px;">Tu asistente inteligente de motos</p>
                </div>
                <div style="background: #1a1d24; border: 1px solid #2a2d35; border-radius: 16px; padding: 32px;">
                  <h2 style="color: #fff; font-size: 20px; margin-top: 0;">Recupera tu contraseña</h2>
                  <p style="color: #aaa; line-height: 1.6;">Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón de abajo para continuar:</p>
                  <div style="text-align: center; margin: 32px 0;">
                    <a href="${recoveryLink}" style="background: linear-gradient(135deg, #00d4aa, #00b894); color: #000; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block;">
                      Restablecer contraseña
                    </a>
                  </div>
                  <p style="color: #666; font-size: 13px;">Este enlace expira en <strong>1 hora</strong>. Si no solicitaste este cambio, ignora este correo.</p>
                </div>
                <p style="text-align: center; color: #555; font-size: 12px; margin-top: 24px;">
                  © 2026 MotoGestor · Diseñado para Colombia 🇨🇴
                </p>
              </div>
            `,
          }),
        });

        if (!emailResponse.ok) {
          console.error("Resend error:", await emailResponse.text());
        }
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
      }
    } else {
      // Dev mode: log the recovery link
      console.log(`[DEV MODE] Recovery link for ${email}: ${recoveryLink}`);
    }

    return new Response(
      JSON.stringify({
        message: "Si el correo está registrado, recibirás un enlace de recuperación.",
        // Only include link in dev mode (no Resend key)
        ...(RESEND_API_KEY ? {} : { dev_recovery_link: recoveryLink }),
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (err) {
    console.error("Recovery error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: corsHeaders() }
    );
  }
}

function corsHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
  };
}
