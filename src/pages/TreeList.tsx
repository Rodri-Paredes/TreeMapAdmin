import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonImg, IonFab, IonFabButton, IonIcon, IonButton, IonButtons, IonAlert } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { mapOutline, addCircleOutline, logOutOutline, trash } from 'ionicons/icons';
import useFetchTrees from '../hooks/useFetchTrees';
import config from './../firebaseConfig';
import { getDatabase, ref, remove } from 'firebase/database';

const TreeList: React.FC = () => {
    const history = useHistory();
    const [trees, setTrees] = useState<Tree[]>([]); // Tipar el estado con la interfaz Tree
    const [showAlert, setShowAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [treeToDelete, setTreeToDelete] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    useFetchTrees(setTrees, config);

    const handleViewMap = () => {
        history.push('/map');
    };

    const handleCreateNew = () => {
        history.push('/tree-register');
    };

    const handleDeleteTree = async (treeId: string) => {
        try {
            const database = getDatabase();
            const treeRef = ref(database, `trees/${treeId}`); // Ajusta la ruta según tu estructura de datos
            await remove(treeRef); // Eliminar el árbol de Firebase
            setTrees((prevTrees) => prevTrees.filter(tree => tree.id !== treeId)); // Filtrar el árbol eliminado en el estado
        } catch (error) {
            console.error("Error al eliminar el árbol:", error);
            setErrorMessage("Error al eliminar el árbol. Inténtalo de nuevo.");
            setShowErrorAlert(true); // Mostrar alerta de error si falla
        }
    };
    
    const confirmDeleteTree = (treeId: string) => {
        setTreeToDelete(treeId); // Guardar el ID del árbol a eliminar
        setShowAlert(true); // Mostrar alerta de confirmación
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
                    {trees.map((tree) => (
                        <IonItem key={tree.id}> {/* Asegúrate de usar un identificador único */}
                            <IonLabel>
                                <h2>{tree.code}</h2>
                                <p>{tree.species?.commonName}</p>
                                <p>{tree.sector?.name}</p>
                                <p>Coordenadas: {tree.latitude}, {tree.longitude}</p>
                            </IonLabel>
                            <div className="tree-img-wrapper">
                                <IonImg className="tree-img" src={tree.imageUrl} alt={tree.code} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                            </div>
                            <IonButton fill="clear" color="danger" onClick={() => confirmDeleteTree(tree.id)}>
                                <IonIcon icon={trash} />
                            </IonButton>
                        </IonItem>
                    ))}
                </IonList>

                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={handleViewMap}>
                        <IonIcon icon={mapOutline} />
                    </IonFabButton>
                </IonFab>
                <IonAlert
                    isOpen={showAlert}
                    onDidDismiss={() => setShowAlert(false)}
                    header="Eliminar Árbol"
                    message="¿Estás seguro de que deseas eliminar este árbol?"
                    buttons={[
                        {
                            text: 'Cancelar',
                            role: 'cancel',
                            handler: () => setTreeToDelete(null), // Restablece el ID del árbol a eliminar
                        },
                        {
                            text: 'Eliminar',
                            handler: () => {
                                if (treeToDelete) {
                                    handleDeleteTree(treeToDelete); // Eliminar el árbol si existe el ID
                                } else {
                                    console.warn("No hay árbol seleccionado para eliminar.");
                                }
                                setTreeToDelete(null); // Restablece el ID del árbol después de eliminar
                            },
                        },
                    ]}
                />

                <IonAlert
                    isOpen={showErrorAlert}
                    onDidDismiss={() => setShowErrorAlert(false)}
                    header="Error"
                    message={errorMessage}
                    buttons={['OK']}
                />

            </IonContent>
        </IonPage>
    );
};

export default TreeList;
