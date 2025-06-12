const { spawn } = require("child_process")
const path = require("path")

// Configuración de servicios
const services = [
  {
    name: "Favorites Service",
    port: 3001,
    path: "./favorites-service",
    emoji: "💖",
  },
  {
    name: "Reviews Service",
    port: 3002,
    path: "./reviews-service",
    emoji: "💬",
  },
  {
    name: "Ratings Service",
    port: 3003,
    path: "./ratings-service",
    emoji: "⭐",
  },
  {
    name: "Auth Service",
    port: 3004,
    path: "./auth-service",
    emoji: "🔐",
  },
  {
    name: "Notifications Service",
    port: 3005,
    path: "./notifications-service",
    emoji: "🔔",
  },
]

console.log("🚀 Iniciando todos los microservicios de WhereToGo...")
console.log("=" * 60)

// Función para iniciar un servicio
function startService(service) {
  const servicePath = path.join(__dirname, service.path)

  console.log(`${service.emoji} Iniciando ${service.name} en puerto ${service.port}...`)

  const child = spawn("node", ["server.js"], {
    cwd: servicePath,
    stdio: "inherit",
    shell: true,
  })

  child.on("error", (error) => {
    console.error(`❌ Error iniciando ${service.name}:`, error.message)
  })

  child.on("exit", (code) => {
    if (code !== 0) {
      console.error(`❌ ${service.name} terminó con código ${code}`)
    } else {
      console.log(`✅ ${service.name} terminó correctamente`)
    }
  })

  return child
}

// Iniciar todos los servicios
const processes = services.map(startService)

// Manejar cierre graceful
process.on("SIGINT", () => {
  console.log("\n🛑 Cerrando todos los microservicios...")

  processes.forEach((child, index) => {
    console.log(`${services[index].emoji} Cerrando ${services[index].name}...`)
    child.kill("SIGINT")
  })

  setTimeout(() => {
    console.log("👋 Todos los servicios han sido cerrados")
    process.exit(0)
  }, 2000)
})

console.log("\n📋 Servicios iniciados:")
services.forEach((service) => {
  console.log(`  ${service.emoji} ${service.name}: http://localhost:${service.port}`)
})

console.log("\n💡 Presiona Ctrl+C para cerrar todos los servicios")
console.log("=" * 60)
