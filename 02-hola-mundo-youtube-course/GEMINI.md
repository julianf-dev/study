# Contexto del Proyecto: HolaMundo-Curso IA

Proyecto Fullstack pedagógico que implementa una aplicación de tareas con una arquitectura modular y limpia.

## Resumen del Proyecto

- **Propósito**: Servir como base para el curso de IA, demostrando patrones de diseño como Inyección de Dependencias y separación de responsabilidades.
- **Frontend**: Aplicación React 18 construida con Vite 4. Incluye gestión completa de tareas (CRUD) y búsqueda en tiempo real.
- **Backend**: Servidor Node.js con Express 4.
- **Persistencia**: Base de datos volátil en memoria.

## Arquitectura y Capas (Backend)

1.  **Modelo (`/backend/models/`)**: Singleton que gestiona una entidad.
    - **Métodos**: `add`, `getById`, `getAll`, `update`, `delete`, `search`.
2.  **Handler (`/backend/handlers/`)**: Controlador de ruta puro.
    - **Firma**: `(model) => (req, res) => { ... }`.
    - **Responsabilidad**: Validación de entrada y respuesta HTTP.
3.  **Rutas (`/backend/index.js`)**: Inyección de modelos en handlers y definición de endpoints.

## Comandos del Proyecto (Desde Raíz)

| Acción                | Comando                                     |
| :-------------------- | :------------------------------------------ |
| **Instalación**       | `npm run install:all`                       |
| **Desarrollo (Todo)** | `npm run dev`                               |
| **Desarrollo (FE)**   | `npm run dev:frontend`                      |
| **Desarrollo (BE)**   | `npm run dev:backend`                       |
| **Build (FE)**        | `npm run build --prefix frontend`           |
| **Linting**           | `TODO: Add linting scripts to package.json` |
| **Testing**           | `TODO: Add testing framework`               |

## Convenciones de Desarrollo

### 1. Naming & Coding Styles

- **Archivos**: `camelCase` para utilidades, `kebab-case.extension` para modelos (`user.model.js`) y `PascalCase` para componentes React (`App.jsx`).
- **Backend**: CommonJS (`require`). Lógica de negocio fuera de los handlers.
- **Frontend**: ESM (`import/export`). Hooks funcionales (`useState`, `useEffect`).

### 2. Error Handling & Responses

- **Validación**: Los handlers deben verificar la integridad de los datos de entrada (`req.body`, `req.params`).
- **Éxito**: 200 (OK), 201 (Created).
- **Error**: 400 (Bad Request), 404 (Not Found), 500 (Internal Error). Siempre retornar un JSON con `{ error: "mensaje" }`.

### 3. State Management

- **Global**: Se utiliza **Zustand** para la gestión del estado global de las tareas. La tienda se encuentra en `frontend/src/store/useTodoStore.js`.
- **Local**: `useState` nativo de React para estados efímeros de componentes (como valores de inputs de edición).

### 4. Git Conventions

- **Commits**: Seguir (`feat:`, `fix:`, `refactor:`, `chore:`).
- **Ramas**: `main` como rama estable.

## Tareas Comunes

### Añadir un nuevo Endpoint (Backend)

1.  Definir métodos en el **Modelo** correspondiente (`models/`).
2.  Crear el **Handler** en `handlers.js` (inyectando el modelo).
3.  Registrar la ruta en `index.js`.

### Añadir un nuevo Componente (Frontend)

1.  Crear el archivo `.jsx` en `frontend/src/`.
2.  Implementar la lógica con Hooks funcionales.
3.  Importar y utilizar en `App.jsx` o el componente padre.

### Ejecutar el Proyecto Completo

Asegúrate de tener instaladas las dependencias y ejecuta `npm run dev` desde la raíz. El frontend estará en `:5173` y el backend en `:3001`.

## Endpoints API

- `GET /api/health`: Estado del servidor.
- `GET /api/users`: Lista de usuarios (hardcoded).
- `GET /api/todos`: Listar todas las tareas (soporta búsqueda mediante `?q=query`).
- `GET /api/todos/:id`: Obtener una tarea por ID.
- `POST /api/todos`: Crear una nueva tarea (requiere `title`).
- `PUT /api/todos/:id`: Actualizar una tarea (título, descripción o estado).
- `DELETE /api/todos/:id`: Eliminar una tarea.
