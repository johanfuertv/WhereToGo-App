Se subio el nuevo branch con la documentacion explicando como instalarlo en tu dispositivo local, igualmente se deja la explicacion aqui en el README:

#Descargar las dependencias
npm install --save-dev typescript @types/react @types/node --legacy-peer-deps

#Correr la Aplicacion
npm run dev

#Activar Microservicios e instalar sus dependencias, y correr los microservicios con Node Server.js
cd microservices/favorites-service
npm install
Node server.js

cd microservices/reviews-service
npm install
node server.js

http://localhost:3000/perfil/favoritos
http://localhost:3001/api/health
http://localhost:3002/api/health
http://localhost:3001/api/favorites
http://localhost:3004/api/health auth service
POST a /api/favorites (puedes probarlo con Postman o cURL)

cd microservices/ratings-service
npm install
node server.js

 GET  /api/health - Estado del servicio
  GET  /api/ratings/:placeId/:placeType - Calificaciones de un lugar
  GET  /api/ratings/:placeId/:placeType/average - Promedio de calificaciones
  POST /api/ratings - Añadir/actualizar calificación
  GET  /api/ratings/user/:userId/:placeId/:placeType - Calificación de usuario
  GET  /api/ratings/stats - Estadísticas generales

cd microservices/notifications-service
cd microservices/auth-service
