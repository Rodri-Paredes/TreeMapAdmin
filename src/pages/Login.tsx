import React, { useEffect, useState } from 'react';
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
  const history = useHistory();

  // Manejar el inicio de sesión
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Iniciar sesión con Firebase Auth
      await signInWithEmailAndPassword(auth, emailOrUsername, password);
      // Redirigir a la lista de árboles después del inicio de sesión
      history.push('/tree-list');
    } catch (err: any) {
      // Mostrar mensaje de error si falla el inicio de sesión
      setError('Usuario o password inválido');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login Alcaldia</IonTitle>
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
            <IonButton expand="full" type="submit" disabled={loading} className="login-button">
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
