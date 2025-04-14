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
} from '@ionic/react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useHistory } from 'react-router-dom';
import config from '../firebaseConfig';

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
      history.push('/tree-list'); // Redirigir después del registro
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
        <IonToolbar>
          <IonTitle>Registro de Usuario</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleRegister}>
          <IonItem>
            <IonLabel position="stacked">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onInput={(e: any) => setEmail(e.target.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Contraseña</IonLabel>
            <IonInput
              type="password"
              value={password}
              onInput={(e: any) => setPassword(e.target.value!)}
              required
            />
          </IonItem>
          <IonButton expand="full" type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </IonButton>
        </form>

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
