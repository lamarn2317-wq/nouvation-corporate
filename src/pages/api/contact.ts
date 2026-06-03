// お問い合わせフォーム API エンドポイント
// - 入力検証
// - 通知メール送信（info@nouvation-official.com 宛）
// - 自動返信メール送信（送信者宛）
//
// 必要な環境変数（Vercel に設定）:
//   RESEND_API_KEY        : Resend の API キー（必須）
//   CONTACT_EMAIL_TO      : 通知メール送信先（任意・デフォルト info@nouvation-official.com）
//   CONTACT_EMAIL_FROM    : 送信元メールアドレス（任意・デフォルト onboarding@resend.dev）
//   CONTACT_EMAIL_REPLY_TO: Reply-To アドレス（任意）

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const TO_EMAIL = import.meta.env.CONTACT_EMAIL_TO || 'info@nouvation-official.com';
const FROM_EMAIL = import.meta.env.CONTACT_EMAIL_FROM || 'NOUVATION <onboarding@resend.dev>';
const REPLY_TO = import.meta.env.CONTACT_EMAIL_REPLY_TO || 'info@nouvation-official.com';

interface ContactBody {
  name?: string;
  email?: string;
  category?: string;
  message?: string;
  website?: string; // honeypot
}

// 入力サニタイズ（HTMLメール用）
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 改行を <br> に変換（メール本文用）
function nl2br(str: string): string {
  return escapeHtml(str).replace(/\n/g, '<br />');
}

function jsonResponse(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: ContactBody;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ message: '不正なリクエストです' }, 400);
  }

  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim();
  const category = String(body.category || '').trim();
  const message = String(body.message || '').trim();
  const website = String(body.website || '').trim(); // honeypot

  // ===== バリデーション =====
  if (website) {
    // ハニーポット欄に入力あり → ボット
    // 成功っぽく返す（ボットに失敗を知らせない）
    return jsonResponse({ ok: true });
  }
  if (!name || name.length > 60) {
    return jsonResponse({ message: 'お名前を正しくご入力ください' }, 400);
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ message: '正しいメールアドレスをご入力ください' }, 400);
  }
  const allowedCategories = ['法人提携・スポンサー', '取材・メディア掲載'];
  if (!allowedCategories.includes(category)) {
    return jsonResponse({ message: 'お問い合わせ種別をご選択ください' }, 400);
  }
  if (!message || message.length < 10 || message.length > 2000) {
    return jsonResponse({ message: 'お問い合わせ内容は10〜2000文字でご入力ください' }, 400);
  }

  // ===== Resend API キーチェック =====
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not set');
    return jsonResponse(
      { message: 'メール送信が現在利用できません。お手数ですが直接メールでご連絡ください。' },
      500
    );
  }

  const resend = new Resend(apiKey);
  const now = new Date();
  const jstTime = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now);

  // ===== 通知メール（NOUVATION 宛）=====
  const notificationHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>新規お問い合わせ</title>
</head>
<body style="margin:0;padding:0;background:#F6F6EE;font-family:'Hiragino Sans','Yu Gothic',sans-serif;color:#231815;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F6EE;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px -8px rgba(35,24,21,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#2e7d32 0%,#1b5e20 100%);padding:24px 32px;color:#ffffff;">
              <p style="margin:0 0 4px 0;font-size:12px;letter-spacing:0.2em;opacity:0.85;">NOUVATION CONTACT</p>
              <h1 style="margin:0;font-size:20px;font-weight:700;">新しいお問い合わせ</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 20px 0;font-size:13px;color:rgba(35,24,21,0.6);">受信日時: ${escapeHtml(jstTime)} (JST)</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(35,24,21,0.08);font-size:12px;font-weight:700;color:rgba(35,24,21,0.55);letter-spacing:0.08em;width:120px;vertical-align:top;">お名前</td>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(35,24,21,0.08);font-size:15px;color:#231815;">${escapeHtml(name)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(35,24,21,0.08);font-size:12px;font-weight:700;color:rgba(35,24,21,0.55);letter-spacing:0.08em;vertical-align:top;">メール</td>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(35,24,21,0.08);font-size:15px;"><a href="mailto:${escapeHtml(email)}" style="color:#2e7d32;text-decoration:none;">${escapeHtml(email)}</a></td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(35,24,21,0.08);font-size:12px;font-weight:700;color:rgba(35,24,21,0.55);letter-spacing:0.08em;vertical-align:top;">種別</td>
                  <td style="padding:12px 0;border-bottom:1px solid rgba(35,24,21,0.08);font-size:15px;color:#231815;"><span style="background:#2e7d32;color:#ffffff;padding:4px 12px;border-radius:9999px;font-size:13px;font-weight:700;">${escapeHtml(category)}</span></td>
                </tr>
                <tr>
                  <td style="padding:16px 0 8px 0;font-size:12px;font-weight:700;color:rgba(35,24,21,0.55);letter-spacing:0.08em;" colspan="2">お問い合わせ内容</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:0 0 8px 0;">
                    <div style="background:#fafaf7;padding:18px 20px;border-radius:10px;font-size:14px;line-height:1.8;color:#231815;white-space:pre-wrap;">${nl2br(message)}</div>
                  </td>
                </tr>
              </table>

              <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(35,24,21,0.08);">
                <a href="mailto:${escapeHtml(email)}?subject=Re:%20NOUVATION%20%E3%81%B8%E3%81%AE%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B" style="display:inline-block;background:#2e7d32;color:#ffffff;padding:10px 20px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:14px;">返信する</a>
              </div>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0 0;font-size:11px;color:rgba(35,24,21,0.5);">このメールは NOUVATION サイトのお問い合わせフォームから自動送信されています</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const notificationText = `【NOUVATION】新しいお問い合わせを受信しました
受信日時: ${jstTime} (JST)

━━━━━━━━━━━━━━━━━━━━━━━━
お名前: ${name}
メール: ${email}
種別: ${category}
━━━━━━━━━━━━━━━━━━━━━━━━

【お問い合わせ内容】
${message}

━━━━━━━━━━━━━━━━━━━━━━━━
このメールは NOUVATION サイトのお問い合わせフォームから自動送信されています。
返信は ${email} 宛にお送りください。`;

  // ===== 自動返信メール（送信者宛）=====
  const autoReplyHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>お問い合わせを受け付けました - NOUVATION</title>
</head>
<body style="margin:0;padding:0;background:#F6F6EE;font-family:'Hiragino Sans','Yu Gothic',sans-serif;color:#231815;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F6EE;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px -8px rgba(35,24,21,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#2e7d32 0%,#1b5e20 100%);padding:32px;text-align:center;color:#ffffff;">
              <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.18);border-radius:50%;line-height:56px;font-size:28px;margin-bottom:12px;">✓</div>
              <h1 style="margin:0;font-size:22px;font-weight:700;letter-spacing:0.02em;">お問い合わせを受け付けました</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.8;">${escapeHtml(name)} 様</p>
              <p style="margin:0 0 20px 0;font-size:15px;line-height:1.9;">この度は NOUVATION にお問い合わせいただき、誠にありがとうございます。<br />以下の内容でお問い合わせを受け付けいたしました。</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fafaf7;border-radius:10px;margin:20px 0;">
                <tr>
                  <td style="padding:14px 18px;font-size:13px;color:#231815;line-height:1.7;">
                    <strong style="color:rgba(35,24,21,0.6);font-weight:700;">種別：</strong> ${escapeHtml(category)}<br />
                    <strong style="color:rgba(35,24,21,0.6);font-weight:700;">受信日時：</strong> ${escapeHtml(jstTime)} (JST)
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 18px 16px 18px;">
                    <div style="border-top:1px solid rgba(35,24,21,0.08);padding-top:14px;font-size:13px;line-height:1.8;color:rgba(35,24,21,0.85);white-space:pre-wrap;">${nl2br(message)}</div>
                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 0 0;font-size:14px;line-height:1.9;color:rgba(35,24,21,0.85);">通常 <strong>2〜3 営業日以内</strong> に担当より個別にご返信いたします。<br />今しばらくお待ちくださいますようお願い申し上げます。</p>

              <div style="margin-top:28px;padding:18px 20px;background:rgba(46,125,50,0.06);border-left:3px solid #2e7d32;border-radius:6px;">
                <p style="margin:0;font-size:13px;line-height:1.7;color:#231815;"><strong style="color:#2e7d32;">📩 ご返信が届かない場合</strong><br />迷惑メールフォルダへの振り分けをご確認のうえ、お手数ですが <a href="mailto:${escapeHtml(REPLY_TO)}" style="color:#2e7d32;font-weight:700;">${escapeHtml(REPLY_TO)}</a> まで直接ご連絡ください。</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#fafaf7;padding:24px 32px;border-top:1px solid rgba(35,24,21,0.06);">
              <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#231815;">NOUVATION</p>
              <p style="margin:0 0 12px 0;font-size:12px;color:rgba(35,24,21,0.6);line-height:1.6;">日本の食の未来を支える、農業情報インフラ</p>
              <p style="margin:0;font-size:12px;">
                <a href="https://nouvation-corporate.vercel.app" style="color:#2e7d32;text-decoration:none;font-weight:700;">公式サイト</a>
                <span style="color:rgba(35,24,21,0.3);margin:0 8px;">|</span>
                <a href="https://lin.ee/upXJEaf" style="color:#2e7d32;text-decoration:none;font-weight:700;">公式LINE</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0 0;font-size:11px;color:rgba(35,24,21,0.5);">このメールは自動送信されています。直接返信いただいても担当者には届きません。</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const autoReplyText = `${name} 様

この度は NOUVATION にお問い合わせいただき、誠にありがとうございます。
以下の内容でお問い合わせを受け付けいたしました。

━━━━━━━━━━━━━━━━━━━━━━━━
種別: ${category}
受信日時: ${jstTime} (JST)
━━━━━━━━━━━━━━━━━━━━━━━━

【お問い合わせ内容】
${message}

━━━━━━━━━━━━━━━━━━━━━━━━

通常 2〜3 営業日以内に担当より個別にご返信いたします。
今しばらくお待ちくださいますようお願い申し上げます。

【ご返信が届かない場合】
迷惑メールフォルダへの振り分けをご確認のうえ、
お手数ですが ${REPLY_TO} まで直接ご連絡ください。

────────────────────────
NOUVATION
日本の食の未来を支える、農業情報インフラ
公式サイト: https://nouvation-corporate.vercel.app
公式LINE: https://lin.ee/upXJEaf
────────────────────────

※ このメールは自動送信されています。直接返信いただいても担当者には届きません。`;

  try {
    // 並行送信
    const [notifyResult, replyResult] = await Promise.allSettled([
      resend.emails.send({
        from: FROM_EMAIL,
        to: TO_EMAIL,
        replyTo: email,
        subject: `【お問い合わせ】${category} - ${name}様`,
        html: notificationHtml,
        text: notificationText,
      }),
      resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        replyTo: REPLY_TO,
        subject: '【NOUVATION】お問い合わせを受け付けました',
        html: autoReplyHtml,
        text: autoReplyText,
      }),
    ]);

    // 通知メールは必須、自動返信は失敗してもOK（ログに残すだけ）
    if (notifyResult.status === 'rejected') {
      console.error('[contact] notification failed:', notifyResult.reason);
      return jsonResponse({ message: 'メール送信に失敗しました。時間をおいて再度お試しください。' }, 500);
    }
    if (replyResult.status === 'rejected') {
      console.error('[contact] auto-reply failed:', replyResult.reason);
      // ユーザーには通知メールが成功してるので OK 返す
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error('[contact] unexpected error:', error);
    return jsonResponse({ message: '予期せぬエラーが発生しました' }, 500);
  }
};
