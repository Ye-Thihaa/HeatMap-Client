// Silences routine debug console output in production builds. console.warn
// and console.error are deliberately left alone — if something actually
// breaks for a real visitor (e.g. someone scanning the QR code at a demo),
// you still want to be able to ask them to open devtools and see it,
// rather than having genuinely useful error output silently disappear
// along with the noisy debug logs.
if (import.meta.env.PROD) {
  console.log = () => {}
  console.debug = () => {}
  console.info = () => {}
}
