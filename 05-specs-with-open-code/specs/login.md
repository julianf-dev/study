# Spec

## Historia de usuario
Como usuario, quiero iniciar sesión en el sistema para acceder a contenido personalizado.

## Objetivo
Permitir que un usuario autenticado ingrese al sistema y acceda al área correspondiente.

## Alcance
- Esta historia cubre el inicio de sesión.
- Esta historia no define cómo se genera ni cómo se construye el contenido personalizado.
- Si un usuario no autenticado intenta acceder al contenido, debe ser redirigido al inicio de sesión.

## Criterios de aceptación
- El usuario puede iniciar sesión con credenciales válidas.
- Si las credenciales son incorrectas, el sistema muestra un error claro.
- Si el usuario no está autenticado e intenta acceder al contenido, el sistema lo redirige al login.
- Al iniciar sesión correctamente, el usuario accede al sistema.

## BDD

### Escenario 1: Inicio de sesión exitoso
Dado que el usuario tiene una cuenta activa
Y está en la pantalla de inicio de sesión
Cuando ingresa credenciales válidas
Entonces el sistema lo autentica
Y le permite acceder al contenido personalizado

### Escenario 2: Credenciales inválidas
Dado que el usuario está en la pantalla de inicio de sesión
Cuando ingresa credenciales incorrectas
Entonces el sistema muestra un mensaje de error
Y no le permite acceder

### Escenario 3: Acceso sin autenticación
Dado que un usuario no autenticado intenta acceder al contenido personalizado
Cuando el sistema detecta que no tiene sesión iniciada
Entonces lo redirige al inicio de sesión

## Suposiciones
- El usuario ya tiene una cuenta creada.
- El usuario conoce sus credenciales de acceso.

## Mockup
```text
+--------------------------------------------------+
|                    INICIAR SESIÓN                |
+--------------------------------------------------+
|                                                  |
|  Usuario / Email                                 |
|  +--------------------------------------------+  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|  Contraseña                                      |
|  +--------------------------------------------+  |
|  |                                            |  |
|  +--------------------------------------------+  |
|                                                  |
|  [ ] Recordarme                                  |
|                                                  |
|  +--------------------------------------------+  |
|  |               INGRESAR                     |  |
|  +--------------------------------------------+  |
|                                                  |
|  ¿Olvidaste tu contraseña?                       |
|                                                  |
+--------------------------------------------------+
```
