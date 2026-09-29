export default function ConfigMissing() {
  return (
    <main className="wrap setup-screen">
      <h1>Connect Supabase to finish setup</h1>
      <p>
        The site cannot find its Supabase keys. Copy <code>.env.example</code> to a new file called{" "}
        <code>.env</code>, add your project URL and public key, then restart with{" "}
        <code>npm run dev</code>.
      </p>
      <p>On Render, add the same two values under Environment, then redeploy.</p>
    </main>
  );
}
