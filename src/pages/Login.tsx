import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonAlert,
  IonLoading,
  IonIcon,
} from '@ionic/react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import config from './../firebaseConfig';
import { useHistory } from 'react-router-dom';
import { lockClosedOutline } from 'ionicons/icons';
import './Login.css';

// Configuración de autenticación
const auth = getAuth(config);

const LoginTree: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true); // Estado para habilitar/deshabilitar el botón
  const history = useHistory();

  // Validación de email
  const isEmailValid = (value: string) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // regex para validar email
    return emailPattern.test(value);
  };

  // Validación de nombre de usuario
  const isUsernameValid = (value: string) => {
    const usernamePattern = /^[a-zA-Z0-9._]+$/; // solo letras, números, puntos y guiones bajos
    return usernamePattern.test(value);
  };

  // Verificación de usuario o email
  const isEmailOrUsernameValid = (value: string) => {
    if (value.includes('@')) {
      return isEmailValid(value);
    } else {
      return isUsernameValid(value);
    }
  };

  // Validación de la contraseña
  const isPasswordValid = (value: string) => {
    const minLength = 6;
    const maxLength = 20;
    const passwordPattern = /^[a-zA-Z0-9]+$/; // solo letras y números
    return value.length >= minLength && value.length <= maxLength && passwordPattern.test(value);
  };

  // Actualiza el estado de habilitación del botón
  useEffect(() => {
    setIsButtonDisabled(!isEmailOrUsernameValid(emailOrUsername) || !isPasswordValid(password));
  }, [emailOrUsername, password]);

  // Manejar el inicio de sesión
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validar campos antes de intentar iniciar sesión
    if (!isEmailOrUsernameValid(emailOrUsername)) {
      if (emailOrUsername.includes('@')) {
        setError('El email no es válido. Verifique el formato.');
      } else {
        setError('El nombre de usuario es inválido. No debe contener caracteres especiales.');
      }
      setShowAlert(true);
      setLoading(false);
      return;
    }

    if (!isPasswordValid(password)) {
      setError('Contraseña inválida. Debe tener entre 6 y 20 caracteres sin espacios ni símbolos especiales.');
      setShowAlert(true);
      setLoading(false);
      return;
    }

    try {
      // Iniciar sesión con Firebase Auth
      await signInWithEmailAndPassword(auth, emailOrUsername, password);
      // Redirigir a la lista de árboles después del inicio de sesión
      history.push('/tree-list');
    } catch (err: any) {
      // Mostrar mensaje de error si falla el inicio de sesión
      setError('Usuario o contraseña inválidos');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login Alcaldía</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="login-container">
          <IonIcon icon={lockClosedOutline} className="security-icon" />
          <form onSubmit={handleLogin}>
            <IonItem>
              <IonLabel position="stacked">Email/Username</IonLabel>
              <IonInput
                type="text"
                value={emailOrUsername}
                onInput={(e: any) => setEmailOrUsername(e.target.value!)}
                required
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onInput={(e: any) => setPassword(e.target.value!)}
                required
              />
            </IonItem>
            <IonButton
              expand="full"
              type="submit"
              disabled={isButtonDisabled || loading}
              className="login-button"
            >
              {loading ? 'Cargando...' : 'Iniciar sesión'}
            </IonButton>
          </form>

          {/* Alertas y carga */}
          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header={'Error'}
            message={error}
            buttons={['OK']}
          />
          <IonLoading isOpen={loading} message={'Autenticando...'} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default LoginTree;