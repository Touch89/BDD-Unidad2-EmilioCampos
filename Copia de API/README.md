# API REST con MySQL Local

Esta API está configurada para usar MySQL en un contenedor Docker local.

## Configuración completada ✅

- MySQL 8.0 corriendo en contenedor Docker
- Base de datos: `tarea_api`
- Puerto MySQL: `3307` (host) -> `3306` (contenedor)
- Usuario: `api_user`
- Password: `api_password`

## Comandos útiles

### Iniciar MySQL

```bash
npm run docker:up
```

### Detener MySQL

```bash
npm run docker:down
```

### Ver logs de MySQL

```bash
npm run docker:logs
```

### Probar conexión a MySQL

```bash
npm run test
```

### Iniciar la API

```bash
npm start
```

## Endpoints disponibles

- `GET /` - Hello World
- `GET /usuarios` - Listar todos los usuarios
- `POST /usuarios` - Crear un nuevo usuario
- `POST /users` - Crear un nuevo usuario (tabla users)
- `GET /products` - Listar todos los productos
- `POST /products` - Crear un nuevo producto
- `GET /api/purchases` - Listar todas las compras
- `GET /api/purchases/:id` - Obtener una compra específica
- `POST /api/purchases` - Crear una nueva compra
- `PUT /api/purchases/:id` - Actualizar una compra
- `DELETE /api/purchases/:id` - Eliminar una compra

## Conexión a MySQL

La aplicación se conecta automáticamente a MySQL local en el puerto 3307.

### Conectar manualmente a MySQL

```bash
docker exec -it mysql-api-db mysql -uapi_user -papi_password tarea_api
```

## Estado actual

✅ MySQL instalado y corriendo en contenedor
✅ Base de datos `tarea_api` creada con todas las tablas
✅ Datos de prueba insertados
✅ API configurada para conectarse a MySQL local
✅ Conexión verificada y funcionando
