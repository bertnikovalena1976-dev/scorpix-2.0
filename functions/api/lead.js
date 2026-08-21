export async function onRequestPost(context) {
  try {
    const data = await context.request.json();

    const name = (data.name || "").trim();
    const contact = (data.contact || "").trim();
    const interests = Array.isArray(data.interests)
      ? data.interests.join(", ")
      : "";
    const request = (data.request || "").trim();

    if (!name || !contact || !request) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Please fill in all required fields."
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    const message =
      `🔔 <b>НОВАЯ ЗАЯВКА SCORPIX</b>\n\n` +
      `👤 <b>Name:</b> ${escapeHtml(name)}\n` +
      `📱 <b>Contact:</b> ${escapeHtml(contact)}\n` +
      `🎯 <b>Interest:</b> ${escapeHtml(interests || "Not specified")}\n\n` +
      `📝 <b>Request:</b>\n${escapeHtml(request)}\n\n` +
      `🌐 <b>Source:</b> ScorpiX Landing`;

    const telegramUrl =
      `https://api.telegram.org/bot${context.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: context.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML"
      })
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      console.error("Telegram error:", telegramResult);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Telegram delivery failed."
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Server error."
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
