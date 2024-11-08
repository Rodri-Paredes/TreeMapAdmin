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

  // Actualiza el estado de habilitación del botón
  useEffect(() => {
    // Deshabilita el botón si falta `@` en el campo de email/username o la contraseña es inválida
    setIsButtonDisabled(!emailOrUsername.includes('@') || password.length < 6 || password.length > 20);
  }, [emailOrUsername, password]);

  // Manejar el inicio de sesión
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!emailOrUsername.includes('@')) {
      setError('El email o nombre de usuario debe contener un @.');
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
          <IonTitle>Login Univalle</IonTitle>
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
