export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>AutoDex API</h1>
      <p>Backend corriendo correctamente.</p>
      <ul>
        <li>GET /api/cars</li>
        <li>GET /api/cars/:id</li>
        <li>POST /api/interactions</li>
        <li>GET /api/interactions</li>
        <li>GET /api/me</li>
        <li>GET /api/rankings</li>
      </ul>
    </main>
  )
}
