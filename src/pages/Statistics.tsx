import React, { useEffect, useState } from 'react';
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonList, IonItem, IonLabel, IonPage, IonHeader, IonButtons, IonToolbar, IonTitle, IonIcon, IonButton, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import config from './../firebaseConfig';
import useFetchTrees from '../hooks/useFetchTrees';
import { arrowBack} from 'ionicons/icons'; 
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
        const userStatistics = Object.entries(userCounts).map(([user, treesRegistered]) => ({
            user,
            treesRegistered,
        }));
    
        return userStatistics;
    };
    const userStatistics = countTreesByUser(trees);

    const handleBack = () => {
        history.goBack();
    };
    useEffect(()=>{
        const auth = getAuth(config);
        const user = auth.currentUser;
        if(!user){
            logout();
        }
    })
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
