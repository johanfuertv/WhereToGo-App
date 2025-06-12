const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { v4: uuidv4 } = require("uuid")
const fs = require("fs")
const path = require("path")

const app = express()
const PORT = 3004

// Configuración
const JWT_SECRET = "wheretogo_secret_key_2024"
const USERS_FILE = path.join(__dirname, "users.json")

// Middleware
app.use(cors())
app.use(express.json())

// Función para leer usuarios del archivo
function readUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf8")
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error("Error al leer usuarios:", error)
    return []
  }
}

// Función para escribir usuarios al archivo
function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
    return true
  } catch (error) {
    console.error("Error al escribir usuarios:", error)
    return false
  }
}

// Middleware para verificar token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" })
  }
}

// Endpoint de salud
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "auth-service" })
})

// Registro de usuario
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role = "traveler", businessDetails, paymentMethod } = req.body

    // Validar datos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nombre, email y contraseña son requeridos" })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Formato de email inválido" })
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" })
    }

    const users = readUsers()

    // Verificar si el usuario ya existe
    const existingUser = users.find((user) => user.email === email)
    if (existingUser) {
      return res.status(409).json({ error: "El usuario ya existe con este email" })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear nuevo usuario
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      ...(role === "business" && {
        businessDetails,
        paymentMethods: paymentMethod ? [paymentMethod] : [],
      }),
    }

    users.push(newUser)

    if (!writeUsers(users)) {
      return res.status(500).json({ error: "Error al guardar el usuario" })
    }

    // Generar token
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, {
      expiresIn: "7d",
    })

    // Respuesta sin contraseña
    const { password: _, ...userResponse } = newUser

    console.log(`👤 Nuevo usuario registrado: ${name} (${email}) - Rol: ${role}`)

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      user: userResponse,
      token,
    })
  } catch (error) {
    console.error("Error en registro:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Login de usuario
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validar datos requeridos
    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña son requeridos" })
    }

    const users = readUsers()

    // Buscar usuario
    const user = users.find((u) => u.email === email)
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({ error: "Cuenta desactivada" })
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciales inválidas" })
    }

    // Actualizar último login
    user.lastLogin = new Date().toISOString()
    writeUsers(users)

    // Generar token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" })

    // Respuesta sin contraseña
    const { password: _, ...userResponse } = user

    console.log(`🔐 Usuario logueado: ${user.name} (${email})`)

    res.json({
      message: "Login exitoso",
      user: userResponse,
      token,
    })
  } catch (error) {
    console.error("Error en login:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Obtener perfil del usuario
app.get("/api/auth/profile", verifyToken, (req, res) => {
  try {
    const users = readUsers()
    const user = users.find((u) => u.id === req.user.id)

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    // Respuesta sin contraseña
    const { password: _, ...userResponse } = user

    res.json(userResponse)
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Actualizar perfil del usuario
app.put("/api/auth/profile", verifyToken, (req, res) => {
  try {
    const { name, businessDetails } = req.body
    const users = readUsers()
    const userIndex = users.findIndex((u) => u.id === req.user.id)

    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    // Actualizar datos
    if (name) users[userIndex].name = name
    if (businessDetails && users[userIndex].role === "business") {
      users[userIndex].businessDetails = { ...users[userIndex].businessDetails, ...businessDetails }
    }

    users[userIndex].updatedAt = new Date().toISOString()

    if (!writeUsers(users)) {
      return res.status(500).json({ error: "Error al actualizar el usuario" })
    }

    // Respuesta sin contraseña
    const { password: _, ...userResponse } = users[userIndex]

    console.log(`📝 Perfil actualizado: ${userResponse.name} (${userResponse.email})`)

    res.json({
      message: "Perfil actualizado exitosamente",
      user: userResponse,
    })
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Cambiar contraseña
app.put("/api/auth/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Contraseña actual y nueva son requeridas" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" })
    }

    const users = readUsers()
    const userIndex = users.findIndex((u) => u.id === req.user.id)

    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuario no encontrado" })
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, users[userIndex].password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" })
    }

    // Encriptar nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    users[userIndex].password = hashedNewPassword
    users[userIndex].updatedAt = new Date().toISOString()

    if (!writeUsers(users)) {
      return res.status(500).json({ error: "Error al cambiar la contraseña" })
    }

    console.log(`🔑 Contraseña cambiada: ${users[userIndex].name} (${users[userIndex].email})`)

    res.json({ message: "Contraseña cambiada exitosamente" })
  } catch (error) {
    console.error("Error al cambiar contraseña:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Obtener estadísticas de usuarios (solo para admin)
app.get("/api/auth/stats", verifyToken, (req, res) => {
  try {
    const users = readUsers()

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.isActive).length,
      travelerUsers: users.filter((u) => u.role === "traveler").length,
      businessUsers: users.filter((u) => u.role === "business").length,
      recentRegistrations: users.filter((u) => new Date(u.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .length,
    }

    res.json(stats)
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Verificar token
app.post("/api/auth/verify", verifyToken, (req, res) => {
  res.json({ valid: true, user: req.user })
})

// Logout (invalidar token - en una implementación real se usaría una blacklist)
app.post("/api/auth/logout", verifyToken, (req, res) => {
  console.log(`👋 Usuario deslogueado: ${req.user.email}`)
  res.json({ message: "Logout exitoso" })
})

// Inicializar archivo de usuarios si no existe
function initializeUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    const initialUsers = [
      {
        id: uuidv4(),
        name: "Usuario Demo",
        email: "demo@wheretogo.com",
        password: bcrypt.hashSync("123456", 10),
        role: "traveler",
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
      },
      {
        id: uuidv4(),
        name: "Negocio Demo",
        email: "business@wheretogo.com",
        password: bcrypt.hashSync("123456", 10),
        role: "business",
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
        businessDetails: {
          name: "Hotel Demo",
          type: "hotel",
          address: "Calle Principal 123",
          city: "Buga",
          description: "Hotel de demostración",
        },
        paymentMethods: [
          {
            type: "credit_card",
            lastFour: "4242",
          },
        ],
      },
    ]

    writeUsers(initialUsers)
    console.log("📁 Archivo de usuarios inicializado con datos de ejemplo")
  }
}

// Inicializar al arrancar
initializeUsersFile()

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🔐 Servicio de Autenticación ejecutándose en http://localhost:${PORT}`)
  console.log(`📋 Endpoints disponibles:`)
  console.log(`  GET  /api/health - Estado del servicio`)
  console.log(`  POST /api/auth/register - Registro de usuario`)
  console.log(`  POST /api/auth/login - Login de usuario`)
  console.log(`  GET  /api/auth/profile - Obtener perfil`)
  console.log(`  PUT  /api/auth/profile - Actualizar perfil`)
  console.log(`  PUT  /api/auth/change-password - Cambiar contraseña`)
  console.log(`  POST /api/auth/verify - Verificar token`)
  console.log(`  POST /api/auth/logout - Logout`)
  console.log(`  GET  /api/auth/stats - Estadísticas`)
  console.log(`👤 Usuarios de prueba:`)
  console.log(`  📧 demo@wheretogo.com / 123456 (Viajero)`)
  console.log(`  📧 business@wheretogo.com / 123456 (Negocio)`)
})
