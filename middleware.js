// Vercel Edge Middleware — HTTP Basic Auth for the hidden admin routes.
// Credentials come from environment variables set in the Vercel dashboard
// (Settings → Environment Variables): OFFICE_USER and OFFICE_PASS.
// If they are not set, access is denied by default.

export const config = { matcher: ['/invoice', '/quotation'] }

export default function middleware(request) {
  const user = process.env.OFFICE_USER
  const pass = process.env.OFFICE_PASS
  const auth = request.headers.get('authorization')

  if (user && pass && auth === 'Basic ' + btoa(`${user}:${pass}`)) {
    return // authenticated — continue to the app
  }

  return new Response('Authentication required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="The Inside Cubicles - Office"' },
  })
}
