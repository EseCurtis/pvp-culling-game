import nodemailer from "nodemailer";

type LeaderboardMovementPayload = {
  email: string;
  characterName: string;
  oldRank: number;
  newRank: number;
};

const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFrom = process.env.SMTP_FROM || smtpUser || "";

const isEmailConfigured = Boolean(smtpUser && smtpPass && smtpFrom);

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!isEmailConfigured || !transporter) {
    console.warn(
      "[mailer] SMTP is not fully configured. Skipping email send.",
    );
    return;
  }

  await transporter.sendMail({
    from: smtpFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}

export async function sendLeaderboardMovementEmail(
  payload: LeaderboardMovementPayload,
) {
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const leaderboardUrl = `${appUrl}/leaderboard`;
  const dashboardUrl = `${appUrl}/dashboard`;

  const direction = payload.newRank > payload.oldRank ? "down" : "up";
  const movementText =
    direction === "down"
      ? `Your rank dropped from #${payload.oldRank} to #${payload.newRank}.`
      : `Your rank improved from #${payload.oldRank} to #${payload.newRank}.`;

  const subject =
    direction === "down"
      ? `Your spot on The Culling Game leaderboard was taken`
      : `You climbed the leaderboard in The Culling Game`;

  const html = `
  <div style="background-color:#02010A;padding:32px 16px;font-family:system-ui,-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;color:#F9FAFB;">
    <table width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:0 auto;background:radial-gradient(circle_at_top,#111827,#02010A);border-radius:24px;border:1px solid rgba(249,250,251,0.06);overflow:hidden;">
      <tr>
        <td style="padding:24px 24px 0 24px;text-align:left;">
          <span style="display:inline-block;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:rgba(249,250,251,0.6);">
            The Culling Game · Leaderboard Alert
          </span>
          <h1 style="margin:12px 0 4px 0;font-size:22px;line-height:1.2;font-weight:600;color:#F9FAFB;">
            ${payload.characterName}'s position has changed
          </h1>
          <p style="margin:0;font-size:13px;line-height:1.6;color:rgba(249,250,251,0.7);">
            ${movementText}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px 8px 24px;">
          <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            <tr>
              <td style="width:50%;padding:12px 12px 12px 0;">
                <div style="border-radius:18px;border:1px solid rgba(249,250,251,0.08);background:rgba(15,23,42,0.9);padding:14px 16px;">
                  <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:rgba(249,250,251,0.5);">
                    Previous Rank
                  </p>
                  <p style="margin:0;font-size:20px;font-weight:600;color:#F9FAFB;">
                    #${payload.oldRank}
                  </p>
                </div>
              </td>
              <td style="width:50%;padding:12px 0 12px 12px;">
                <div style="border-radius:18px;border:1px solid rgba(249,250,251,0.08);background:rgba(15,23,42,0.9);padding:14px 16px;">
                  <p style="margin:0 0 4px 0;font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:rgba(249,250,251,0.5);">
                    Current Rank
                  </p>
                  <p style="margin:0;font-size:20px;font-weight:600;color:${
                    direction === "down" ? "#F87171" : "#4ADE80"
                  };">
                    #${payload.newRank}
                  </p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 24px 24px 24px;">
          <p style="margin:0 0 12px 0;font-size:12px;line-height:1.6;color:rgba(249,250,251,0.7);">
            Jump back in to reclaim your spot or push even higher. Winning battles and evolving your character will boost your ranking.
          </p>
          <table cellspacing="0" cellpadding="0" style="margin-top:12px;">
            <tr>
              <td>
                <a href="${leaderboardUrl}" style="display:inline-block;background-color:#F9FAFB;color:#020617;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;padding:10px 18px;border-radius:999px;">
                  View Leaderboard
                </a>
              </td>
              <td style="width:12px;"></td>
              <td>
                <a href="${dashboardUrl}" style="display:inline-block;border:1px solid rgba(249,250,251,0.4);color:#E5E7EB;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;padding:9px 16px;border-radius:999px;">
                  Open Dashboard
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 24px 20px 24px;">
          <p style="margin:0;font-size:10px;line-height:1.6;color:rgba(148,163,184,0.9);">
            You are receiving this email because your character's ranking changed on The Culling Game leaderboard.
          </p>
        </td>
      </tr>
    </table>
  </div>
  `;

  await sendMail({
    to: payload.email,
    subject,
    html,
  });
}


