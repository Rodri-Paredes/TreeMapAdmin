import React, { useEffect, useState } from 'react';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonPage,
  IonHeader,
  IonButtons,
  IonToolbar,
  IonTitle,
  IonIcon,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import config from './../firebaseConfig';
import useFetchTrees from '../hooks/useFetchTrees';
import { arrowBack } from 'ionicons/icons';
import { getAuth } from 'firebase/auth';
import useLogout from '../hooks/useLogout';

const Statistics: React.FC = () => {
  const history = useHistory();
  const [trees, setTrees] = useState<Tree[]>([]);
  const logout = useLogout();
  useFetchTrees(setTrees, config);

  const countTreesByUser = (trees: Tree[]) => {
    const userCounts: Record<string, number> = trees.reduce((acc, tree) => {
      acc[tree.createdBy] = (acc[tree.createdBy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(userCounts).map(([user, treesRegistered]) => ({ user, treesRegistered }));
  };

  const userStatistics = countTreesByUser(trees);

  const handleBack = () => {
    history.goBack();
  };

  useEffect(() => {
    const auth = getAuth(config);
    const user = auth.currentUser;
    if (!user) {
      logout();
    }
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="tertiary">
          <IonButtons slot="start">
            <IonButton onClick={handleBack} fill="clear">
              <IonIcon slot="icon-only" icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>📊 Estadísticas de Usuarios</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            {userStatistics.map((stat, index) => (
              <IonCol size="12" sizeMd="6" sizeLg="4" key={index}>
                <IonCard color="light" style={{ borderLeft: '6px solid #3880ff' }}>
                  <IonCardHeader>
                    <IonCardTitle style={{ fontSize: '1.2rem' }}>👤 {stat.user}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>🌲 Árboles registrados: <strong>{stat.treesRegistered}</strong></p>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Statistics;