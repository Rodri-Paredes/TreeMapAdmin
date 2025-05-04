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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import config from './../firebaseConfig';
import { useHistory } from 'react-router-dom';
import { lockClosedOutline } from 'ionicons/icons';
import './Login.css';
import useLogout from '../hooks/useLogout';

const SESSION_DURATION = 1800000; // 30 minutos

const auth = getAuth(config);

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
    const interval = setInterval(checkSessionExpiration, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle className="ion-text-center">🌿 Portal de Árboles</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding login-elegant-bg">
        <IonGrid className="ion-justify-content-center ion-align-items-center" style={{ height: '100%' }}>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
              <IonCard className="login-card">
                <IonCardHeader>
                  <IonCardTitle className="ion-text-center">
                    <IonIcon icon={lockClosedOutline} className="security-icon" />
                    <div>Iniciar Sesión</div>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <form onSubmit={handleLogin} className="login-form">
                    <IonItem lines="none">
                      <IonLabel position="stacked">Correo Electrónico</IonLabel>
                      <IonInput
                        type="email"
                        value={emailOrUsername}
                        onInput={(e: any) => setEmailOrUsername(e.target.value!)}
                        required
                      />
                    </IonItem>

                    <IonItem lines="none">
                      <IonLabel position="stacked">Contraseña</IonLabel>
                      <IonInput
                        type="password"
                        value={password}
                        onInput={(e: any) => setPassword(e.target.value!)}
                        required
                      />
                    </IonItem>

                    <IonButton
                      expand="block"
                      type="submit"
                      disabled={isButtonDisabled || loading}
                      className="login-button"
                    >
                      {loading ? 'Cargando...' : 'Entrar'}
                    </IonButton>

                    <IonButton expand="block" routerLink="/register" color="light" className="register-button">
                      Crear cuenta nueva
                    </IonButton>
                  </form>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Error'}
          message={error}
          buttons={['OK']}
        />

        <IonLoading isOpen={loading} message={'Autenticando...'} />
      </IonContent>
    </IonPage>
  );
};

export default LoginTree;