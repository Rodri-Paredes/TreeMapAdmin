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
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import config from './../firebaseConfig';
import { useHistory } from 'react-router-dom';
import { lockClosedOutline, logOut } from 'ionicons/icons';
import './Login.css';
import useLogout from '../hooks/useLogout';

// Duración de la sesión en milisegundos (ejemplo: 1 hora = 3600000 ms)
const SESSION_DURATION = 1800000;

const auth = getAuth(config);
const user = auth.currentUser;

const LoginTree: React.FC = () => {
  const [emailOrUsername, setEmailOrUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
  const history = useHistory();
  const logout = useLogout();


  useEffect(() => {
    setIsButtonDisabled(!emailOrUsername.includes('@') || password.length < 6 || password.length > 20);
  }, [emailOrUsername, password]);

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
      await signInWithEmailAndPassword(auth, emailOrUsername, password);

      const expirationTime = Date.now() + SESSION_DURATION;
      localStorage.setItem('sessionExpiration', expirationTime.toString());
      setEmailOrUsername('');
      setPassword('');
      history.push('/tree-list');
    } catch (err: any) {
      setError('Usuario o contraseña inválidos');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const checkSessionExpiration = () => {
    const expirationTime = localStorage.getItem('sessionExpiration');
    if (expirationTime && Date.now() > parseInt(expirationTime)) {
      logout();
    }
  };


  useEffect(() => {
    const interval = setInterval(checkSessionExpiration, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
