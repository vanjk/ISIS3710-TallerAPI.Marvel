# Taller – API de Personajes Marvel con NestJS

Este repositorio contiene la implementación de una API REST construida con NestJS que permite a S.H.I.E.L.D. llevar el registro de los personajes del universo Marvel y de los equipos a los que pertenecen.

**Dueñas del repo:** Vanesa Montaño y Gabriela Perdomo



## 1. Decisiones Técnicas y Arquitectura

### Conexión a Base de Datos (TypeORM en `app.module.ts`)
Para la interacción con la base de datos PostgreSQL, decidimos utilizar TypeORM, ya que es el estándar oficial en el ecosistema de NestJS. Esto nos permitió mapear las tablas existentes a entidades. 

**Nota importante sobre la configuración:** 
Dado que los requerimientos técnicos indicaban explícitamente que *"no se deben crear ni modificar tablas"* y que debíamos trabajar con el esquema ya existente, en la configuración de `TypeOrmModule.forRoot()` en nuestro `app.module.ts` establecimos la propiedad `synchronize: false`. De esta forma garantizamos que la API solo lea y escriba datos sin alterar la estructura original entregada en Docker.

### Validaciones Globales (`class-validator` y `class-transformer`)
Para cumplir con el requerimiento de validar los datos de entrada en las peticiones POST, PUT y PATCH, implementamos un sistema de validación automático utilizando Data Transfer Objects (DTOs) apoyados por dos librerías:

*   **class-validator:** Nos permite usar decoradores (como `@IsString()`, `@IsInt()`, etc.) directamente en nuestras clases DTO (ej. `create-character.dto.ts`) para definir las reglas exactas de cada campo obligatorio u opcional.
*   **class-transformer:** Trabaja en conjunto para transformar los datos planos en objetos reales de nuestras clases.

**!!! Otra cosa importante:**
Para no repetir código, activamos estas validaciones de forma global en el archivo `main.ts` utilizando un `ValidationPipe` con la siguiente configuración:

```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true, // Ignora y elimina silenciosamente cualquier dato extra que envíe el usuario y no esté definido en el DTO.
  forbidNonWhitelisted: true, // Lanza automáticamente un error 400 Bad Request si el usuario envía propiedades no permitidas.
  transform: true, // Transforma automáticamente los tipos de datos (ej. convierte un ID de string a number).
}));
```
Gracias a esto, NestJS intercepta el cuerpo de las peticiones (`@Body()`) y aplica las reglas antes de que lleguen a nuestros controladores.



## 2. Reglas de Negocio
Todas las reglas de negocio exigidas en el taller (manejo de códigos 400, 404 Not Found y 409 Conflict) fueron implementadas con éxito. 
Para facilitar la revisión del código por parte del equipo docente, hemos dejado comentarios explícitos en los archivos `teams.service.ts` y `characters.service.ts` indicando exactamente en qué bloque de código se está cumpliendo cada regla.



## 3. Pruebas con Postman
Todos los endpoints fueron probados exitosamente. Las colecciones con las peticiones configuradas y listas para ejecutar se encuentran guardadas dentro de este mismo repositorio en la carpeta local llamada `/postman`. 
Para probarlas, puede importar esta carpeta directamente en Postman.

---

##  Referencias
Para el desarrollo de la estructura inicial de este taller, además de la documentación oficial de NestJS, nos apoyamos en [NestJS with TypeORM & PostgreSQL - Tutorial](https://www.youtube.com/watch?v=ROCJOF2Frt4)
