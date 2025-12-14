/**
 * Firebase Configuration
 * 
 * IMPORTANTE: Antes de usar, debes:
 * 1. Crear un proyecto en Firebase Console (https://console.firebase.google.com)
 * 2. Habilitar Authentication > Google Sign-in
 * 3. Crear Firestore Database
 * 4. Crear Storage
 * 5. Copiar las credenciales aquí
 */

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// TODO: Reemplazar con tus credenciales de Firebase
// Las obtienes en: Project Settings > General > Your apps > Web app
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_PROJECT_ID.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT_ID.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Servicios de Firebase
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const googleProvider = new GoogleAuthProvider()

// Configurar el provider de Google
googleProvider.setCustomParameters({
    prompt: 'select_account' // Siempre mostrar selector de cuenta
})

export default app
