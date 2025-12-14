# 🔥 Configuración de Firebase para MELANOX

## Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Click en "Agregar proyecto"
3. Nombre del proyecto: **MELANOX** (o el que prefieras)
4. Deshabilita Google Analytics (opcional)
5. Click en "Crear proyecto"

---

## Paso 2: Configurar Autenticación

1. En el menú lateral, ve a **Authentication**
2. Click en "Comenzar"
3. En la pestaña "Sign-in method":
   - Click en **Google**
   - Activa el toggle
   - Selecciona un email de soporte
   - Click en "Guardar"

---

## Paso 3: Crear Firestore Database

1. En el menú lateral, ve a **Firestore Database**
2. Click en "Crear base de datos"
3. Selecciona **Modo de producción**
4. Elige la ubicación más cercana (ej: `southamerica-east1`)
5. Click en "Habilitar"

### Configurar Reglas de Seguridad

En la pestaña "Reglas", reemplaza con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Solo el dueño puede ver sus análisis
    match /analyses/{analysisId} {
      allow read, write: if request.auth != null && 
                           resource.data.userId == request.auth.uid;
      allow create: if request.auth != null;
    }
  }
}
```

Click en "Publicar"

---

## Paso 4: Configurar Storage

1. En el menú lateral, ve a **Storage**
2. Click en "Comenzar"
3. Selecciona **Modo de producción**
4. Click en "Listo"

### Configurar Reglas de Storage

En la pestaña "Reglas", reemplaza con:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Solo el dueño puede acceder a sus imágenes
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Click en "Publicar"

---

## Paso 5: Obtener Credenciales

1. En el menú lateral, ve a **Configuración del proyecto** (⚙️)
2. En la sección "Tus apps", click en el ícono web `</>`
3. Nombre de la app: **MELANOX Web**
4. NO marques "Firebase Hosting"
5. Click en "Registrar app"
6. Copia el objeto `firebaseConfig`

---

## Paso 6: Configurar en el Proyecto

1. Abre el archivo `src/config/firebase.js`
2. Reemplaza las credenciales:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
}
```

3. Guarda el archivo

---

## Paso 7: Probar la Aplicación

```bash
npm run dev
```

1. Abre http://localhost:5173
2. Click en "Iniciar sesión"
3. Click en "Continuar con Google"
4. Selecciona tu cuenta de Google
5. ¡Listo! Deberías estar autenticado

---

## 🔒 Seguridad

### Variables de Entorno (Recomendado para Producción)

1. Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

2. Actualiza `src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}
```

3. Agrega `.env` al `.gitignore` (ya está incluido)

---

## 📊 Estructura de Base de Datos

### Colección: `users`
```javascript
{
  uid: "google-user-id",
  email: "usuario@gmail.com",
  displayName: "Nombre Usuario",
  photoURL: "url-foto-perfil",
  createdAt: timestamp,
  lastLogin: timestamp,
  consentGiven: false,
  totalAnalysis: 0
}
```

### Colección: `analyses` (Próximamente)
```javascript
{
  id: "auto-id",
  userId: "user-uid",
  imageUrl: "storage-url",
  uploadedAt: timestamp,
  result: { ... }
}
```

---

## ✅ Verificación

- [ ] Proyecto Firebase creado
- [ ] Google Auth habilitado
- [ ] Firestore Database creado
- [ ] Storage configurado
- [ ] Reglas de seguridad publicadas
- [ ] Credenciales copiadas en `firebase.js`
- [ ] Login funciona correctamente

---

## 🆘 Problemas Comunes

### Error: "Firebase: Error (auth/unauthorized-domain)"
**Solución**: En Firebase Console > Authentication > Settings > Authorized domains, agrega `localhost`

### Error: "Missing or insufficient permissions"
**Solución**: Verifica que las reglas de Firestore estén publicadas correctamente

### Error: "Firebase: Firebase App named '[DEFAULT]' already exists"
**Solución**: Ya tienes Firebase inicializado, recarga la página

---

## 📚 Recursos

- [Firebase Docs](https://firebase.google.com/docs)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firestore](https://firebase.google.com/docs/firestore)
- [Storage](https://firebase.google.com/docs/storage)
