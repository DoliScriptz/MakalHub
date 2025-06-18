import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const ua = req.headers['user-agent']
  if (ua !== 'MakalHubExecutor') return res.status(403).end('Forbidden')

  const { name } = req.query
  const filePath = path.resolve('./scripts', `${name}.lua`)

  if (!fs.existsSync(filePath)) return res.status(404).end('Script not found')

  const scriptContent = fs.readFileSync(filePath, 'utf-8')
  res.setHeader('Content-Type', 'text/plain')
  res.status(200).send(scriptContent)
}
