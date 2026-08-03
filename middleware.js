// Vercel Edge Middleware — session login for the hidden admin routes.
// Credentials come from env vars OFFICE_USER / OFFICE_PASS (Vercel dashboard).
// On correct login a signed cookie valid for 24 hours is issued; after it
// expires (or if tampered with), the login page is shown again.

export const config = {
  matcher: ['/invoice', '/quotation', '/office-login', '/office-logout'],
}

const SESSION_SECONDS = 24 * 60 * 60 // 24 hours

async function hmac(data, key) {
  const enc = new TextEncoder()
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function safeNext(value) {
  return value === '/quotation' ? '/quotation' : '/invoice'
}

function getCookie(header, name) {
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return v.join('=')
  }
  return null
}

function loginPage(next, showError) {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex, nofollow" />
<title>Sign in — The Inside Cubicles</title>
<style>
  * { box-sizing: border-box; margin: 0; }
  body {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: #0e2338; color: #e9eff5;
    font-family: -apple-system, 'Segoe UI', Roboto, sans-serif;
  }
  .card {
    width: min(360px, 92vw); background: #142e47; padding: 2rem;
    border: 1px solid rgba(233,239,245,0.15);
  }
  .brand { display: flex; flex-direction: column; align-items: center; gap: 12px;
    margin-bottom: 1.8rem; text-align: center; }
  .brand svg { width: 36px; height: 36px; }
  .brand .t { font-weight: 800; letter-spacing: 0.08em; font-size: 1.05rem; }
  .brand .s { font-size: 0.66rem; letter-spacing: 0.34em; color: #9db2c5; }
  label { display: block; margin-top: 1rem; font-size: 0.72rem; letter-spacing: 0.1em;
    text-transform: uppercase; color: #9db2c5; }
  input { display: block; width: 100%; margin-top: 0.35rem; padding: 0.6em 0.7em;
    background: #0e2338; border: 1px solid rgba(233,239,245,0.25); color: #e9eff5;
    font: inherit; }
  button { width: 100%; margin-top: 1.4rem; padding: 0.75em; border: 0;
    background: #ff7a4d; color: #091a2b; font-weight: 700; letter-spacing: 0.08em;
    text-transform: uppercase; font-size: 0.8rem; cursor: pointer; }
  .err { margin-top: 1rem; font-size: 0.8rem; color: #ff7a4d; }
  .note { margin-top: 1.2rem; font-size: 0.7rem; color: #9db2c5; text-align: center; }
</style>
</head>
<body>
  <form class="card" method="POST" action="/office-login">
    <div class="brand">
      <svg viewBox="0 0 32 32"><rect x="2" y="2" width="13" height="13" fill="#ff7a4d"/><rect x="17" y="2" width="13" height="13" fill="none" stroke="#e9eff5" stroke-width="2"/><rect x="2" y="17" width="13" height="13" fill="none" stroke="#e9eff5" stroke-width="2"/><rect x="17" y="17" width="13" height="13" fill="none" stroke="#e9eff5" stroke-width="2"/></svg>
      <span class="t">THE INSIDE CUBICLES</span>
      <span class="s">OFFICE</span>
    </div>
    <input type="hidden" name="next" value="${next}" />
    <label>Username
      <input name="user" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" inputmode="email" autofocus required />
    </label>
    <label>Password
      <input name="pass" type="password" autocomplete="current-password" required />
    </label>
    ${showError ? '<p class="err">Wrong username or password — try again.</p>' : ''}
    <button type="submit">Sign in</button>
    <p class="note">Session stays valid for 24 hours, then you sign in again.</p>
  </form>
</body>
</html>`
  return new Response(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export default async function middleware(request) {
  const user = process.env.OFFICE_USER
  const pass = process.env.OFFICE_PASS
  if (!user || !pass) {
    return new Response('Not configured', { status: 503 })
  }

  const key = `${user}:${pass}:tic-session-v1`
  const url = new URL(request.url)

  if (url.pathname === '/office-logout') {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/',
        'Set-Cookie': 'tic_session=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax',
      },
    })
  }

  if (url.pathname === '/office-login') {
    if (request.method !== 'POST') {
      return loginPage(safeNext(url.searchParams.get('next')), false)
    }
    const form = await request.formData()
    const next = safeNext(form.get('next'))
    const givenUser = String(form.get('user') || '').trim().toLowerCase()
    if (givenUser === user.trim().toLowerCase() && form.get('pass') === pass) {
      const exp = String(Date.now() + SESSION_SECONDS * 1000)
      const token = `${exp}.${await hmac(exp, key)}`
      return new Response(null, {
        status: 302,
        headers: {
          Location: next,
          'Set-Cookie': `tic_session=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
        },
      })
    }
    return loginPage(next, true)
  }

  // protected routes: /invoice, /quotation
  const token = getCookie(request.headers.get('cookie') || '', 'tic_session')
  if (token) {
    const dot = token.indexOf('.')
    const exp = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    if (Number(exp) > Date.now() && sig === (await hmac(exp, key))) {
      return // session valid — continue to the app
    }
  }
  return loginPage(url.pathname, false)
}
