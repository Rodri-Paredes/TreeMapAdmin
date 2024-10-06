import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonImg, IonFab, IonFabButton, IonIcon, IonButton, IonButtons } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { mapOutline, addCircleOutline } from 'ionicons/icons';
import useFetchTrees from '../hooks/useFetchTrees';
import config from './../firebaseConfig';

const TreeList: React.FC = () => {
    const history = useHistory();
    const [trees, setTrees] = useState<Tree[]>([]);
    useFetchTrees(setTrees,config)
    const handleViewMap = () => {
        history.push('/map');
    };

    const handleCreateNew = () => {
        history.push('/tree-register');
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Lista de Árboles</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleCreateNew} fill="clear" size="small">
                            <IonIcon slot="icon-only" icon={addCircleOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList>
                    {trees.map((tree, index) => (
                        <IonItem key={index}>
                            <IonLabel>
                                <h2>{tree.code}</h2>
                                <p>{tree.species?.commonName}</p>
                                <p>{tree.sector?.name}</p>
                                <p>Coordenadas: {tree.latitude}, {tree.longitude}</p>
                            </IonLabel>
                            <div className="tree-img-wrapper">
                                <IonImg className="tree-img" src={tree.imageUrl} alt={tree.code} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                            </div>
                        </IonItem>
                    ))}
                </IonList>

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={handleViewMap}>
                        <IonIcon icon={mapOutline} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default TreeList;
