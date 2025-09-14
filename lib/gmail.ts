interface GmailTokens {
  access_token: string
  refresh_token?: string
  gmail_email: string
}

export async function refreshGmailToken(refreshToken: string): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  const tokens = await response.json()

  if (!response.ok) {
    throw new Error(tokens.error_description || "Failed to refresh token")
  }

  return tokens.access_token
}

export async function sendGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string,
  isHtml = false,
): Promise<void> {
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    `Content-Type: ${isHtml ? "text/html" : "text/plain"}; charset=utf-8`,
    "",
    body,
  ].join("\n")

  const encodedMessage = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw: encodedMessage,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || "Failed to send email")
  }
}

export async function testGmailConnection(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return response.ok
  } catch (error) {
    return false
  }
}
