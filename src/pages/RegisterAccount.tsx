import React, { useState } from 'react';
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
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useHistory } from 'react-router-dom';
import config from '../firebaseConfig';
import './Login.css';

const auth = getAuth(config);

const RegisterTree: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const history = useHistory();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email.includes('@') || password.length < 6) {
      setError('Email inválido o contraseña demasiado corta.');
      setShowAlert(true);
      setLoading(false);
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail('');
      setPassword('');
      history.push('/tree-list');
    } catch (err: any) {
      setError('Error al registrar usuario');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle className="ion-text-center">🌱 Crear Cuenta</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding login-elegant-bg">
        <IonGrid className="ion-justify-content-center ion-align-items-center" style={{ height: '100%' }}>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
              <IonCard className="login-card">
                <IonCardHeader>
                  <IonCardTitle className="ion-text-center">
                    Regístrate para comenzar
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <form onSubmit={handleRegister} className="login-form">
                    <IonItem lines="none">
                      <IonLabel position="stacked">Correo Electrónico</IonLabel>
                      <IonInput
                        type="email"
                        value={email}
                        onInput={(e: any) => setEmail(e.target.value!)}
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

                    <IonButton expand="block" type="submit" disabled={loading} className="login-button">
                      {loading ? 'Registrando...' : 'Registrarse'}
                    </IonButton>

                    <IonButton expand="block" routerLink="/login" color="light" className="register-button">
                      Ya tengo una cuenta
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

        <IonLoading isOpen={loading} message={'Creando cuenta...'} />
      </IonContent>
    </IonPage>
  );
};

export default RegisterTree;