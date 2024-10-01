import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonImg, IonFab, IonFabButton, IonIcon, IonButton, IonButtons } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { mapOutline, addCircleOutline } from 'ionicons/icons';

const TreeList: React.FC = () => {
    const history = useHistory();

    const handleViewMap = () => {
        history.push('/map');
    };

    const trees = [
        {
            name: 'Tajibo',
            species: 'Handroanthus Abayoy',
            latitude: -16.5000,
            longitude: -68.1500,
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/treemap-de6cf.appspot.com/o/tajibo.jpeg?alt=media&token=9fdfbc29-ba8c-45b8-9992-abd0c0a0e9cd'
        },
        {
            name: 'Tipuana',
            species: 'Árbol semi-caducifolio y alóctono',
            latitude: -1.9500,
            longitude: 30.0586,
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/treemap-de6cf.appspot.com/o/tipuana.jpeg?alt=media&token=edc51831-0861-438d-842c-59d7e954e8ea'
        },
        {
            name: 'Pacay',
            species: 'Árbol mimosáceo de la familia de las leguminosas',
            latitude: 26.8206,
            longitude: 75.7400,
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/treemap-de6cf.appspot.com/o/Pacay.jpg?alt=media&token=cf71c1f6-7ebb-43c2-91cd-04fdee5854f2'
        },
        {
            name: 'Jacaranda',
            species: 'Árbol subtropical de la familia Bignoniaceae oriundo de Sudamérica',
            latitude: -1.2921,
            longitude: 36.8219,
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/treemap-de6cf.appspot.com/o/jacaranda.jpg?alt=media&token=2f18366d-5b48-4703-b27c-07707be81ae8'
        },
        {
            name: 'Álamo',
            species: 'El álamo recibe el nombre científico Populus alba',
            latitude: -23.5505,
            longitude: -46.6333,
            imageUrl: 'https://firebasestorage.googleapis.com/v0/b/treemap-de6cf.appspot.com/o/Alamo.jpg?alt=media&token=6ef5dbee-3428-4677-b4f0-7f1832478e9f'
        }
    ];

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
                                <h2>{tree.name}</h2>
                                <p>{tree.species}</p>
                                <p>Coordenadas: {tree.latitude}, {tree.longitude}</p>
                            </IonLabel>
                            <div className="tree-img-wrapper">
                                <IonImg className="tree-img" src={tree.imageUrl} alt={tree.name} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
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
