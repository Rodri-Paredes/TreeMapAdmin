import React, { useState } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonPage, IonHeader, IonButtons, IonToolbar, IonTitle, IonIcon, IonButton, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import config from './../firebaseConfig';
import useFetchTrees from '../hooks/useFetchTrees';
import { arrowBack} from 'ionicons/icons'; 


const Statistics: React.FC = () => {
    // Datos hardcoded
    const history = useHistory();
    const [trees, setTrees] = useState<Tree[]>([]);
    useFetchTrees(setTrees, config);
    console.log(trees);

    const countTreesByUser = (trees: Tree[]) => {
        // Usamos reduce para contar los árboles por usuario
        const userCounts: Record<string, number> = trees.reduce((acc, tree) => {
            acc[tree.createdBy] = (acc[tree.createdBy] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    
        // Convertimos el objeto a un array de objetos
        const userStatistics = Object.entries(userCounts).map(([user, treesRegistered]) => ({
            user,
            treesRegistered,
        }));
    
        return userStatistics;
    };
    const userStatistics = countTreesByUser(trees);
    console.log(userStatistics);

    const handleBack = () => {
        history.goBack();
    };
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={handleBack} fill="clear">
                            <IonIcon slot="icon-only" icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Estadisticas</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonCard>
                    <IonCardContent>
                        <IonList>
                            {userStatistics.map((stat, index) => (
                                <IonItem key={index}>
                                    <IonLabel>
                                        {stat.user}: {stat.treesRegistered}
                                    </IonLabel>
                                </IonItem>
                            ))}
                        </IonList>
                    </IonCardContent>
                </IonCard>
            </IonContent>
        </IonPage>
    );
};

export default Statistics;
