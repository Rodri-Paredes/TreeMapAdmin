import React, { useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonImg, IonFab, IonFabButton, IonIcon, IonButton, IonButtons, IonAlert, IonSelect, IonSelectOption } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { mapOutline, addCircleOutline, logOutOutline, trash } from 'ionicons/icons';
import useFetchTrees from '../hooks/useFetchTrees';
import config from './../firebaseConfig';
import { getDatabase, ref, remove, get } from 'firebase/database';
import useLogout from '../hooks/useLogout';

const TreeList: React.FC = () => {
    const history = useHistory();
    const [trees, setTrees] = useState<Tree[]>([]);
    const [showAlert, setShowAlert] = useState(false);
    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [treeToDelete, setTreeToDelete] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [selectedSpecies, setSelectedSpecies] = useState<string>(''); // Especie seleccionada
    const [speciesList, setSpeciesList] = useState<any[]>([]); // Lista de especies
    const logout = useLogout();

    useFetchTrees(setTrees, config);

    const handleViewMap = () => {
        history.push('/map');
    };

    const handleCreateNew = () => {
        history.push('/tree-register');
    };

    const loadSpecies = async () => {
        try {
            const database = getDatabase();
            const speciesRef = ref(database, 'species'); // Ajusta esta ruta según tu base de datos
            const snapshot = await get(speciesRef);
            
            if (snapshot.exists()) {
                const speciesData = snapshot.val();
                const speciesArray = Object.keys(speciesData).map(key => ({
                    id: key,
                    ...speciesData[key]
                }));
                setSpeciesList(speciesArray);
            }
        } catch (error) {
            console.error("Error al cargar las especies:", error);
        }
    };

    useEffect(() => {
        loadSpecies();
    }, []);

    const handleDeleteTree = async (treeId: string) => {
        try {
            const database = getDatabase();
            const treeRef = ref(database, `trees/${treeId}`);
            await remove(treeRef);
            setTrees((prevTrees) => prevTrees.filter(tree => tree.id !== treeId));
        } catch (error) {
            console.error("Error al eliminar el árbol:", error);
            setErrorMessage("Error al eliminar el árbol. Inténtalo de nuevo.");
            setShowErrorAlert(true);
        }
    };

    const confirmDeleteTree = (treeId: string) => {
        setTreeToDelete(treeId);
        setShowAlert(true);
    };

    const filteredTrees = selectedSpecies 
        ? trees.filter(tree => tree.speciesId === selectedSpecies)
        : trees;

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={logout} fill="clear" size="small">
                            <IonIcon slot="icon-only" icon={logOutOutline} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Lista de Árboles</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleCreateNew} fill="clear" size="small">
                            <IonIcon slot="icon-only" icon={addCircleOutline} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <IonLabel>Especie</IonLabel>
                    <IonSelect
                        value={selectedSpecies}
                        placeholder="Seleccionar especie"
                        onIonChange={(e) => setSelectedSpecies(e.detail.value!)}
                    >
                        <IonSelectOption value="">Todos</IonSelectOption>
                        {speciesList.map(species => (
                            <IonSelectOption key={species.id} value={species.id}>
                                {species.commonName}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>

                <IonList>
                    {filteredTrees.map((tree) => (
                        <IonItem key={tree.id} button onClick={() => history.push({ pathname: '/tree-register', state: { treeData: tree } })}>
                            <IonLabel>
                                <h2>{tree.code}</h2>
                                <p>{tree.species?.commonName}</p>
                                <p>{tree.sector?.name}</p>
                                <p>Coordenadas: {tree.latitude}, {tree.longitude}</p>
                            </IonLabel>
                            <div className="tree-img-wrapper">
                                <IonImg className="tree-img" src={tree.imageUrl} alt={tree.code} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                            </div>
                            <IonButton fill="clear" color="danger" onClick={(e) => {e.stopPropagation(); confirmDeleteTree(tree.id);}}>
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
                            handler: () => setTreeToDelete(null),
                        },
                        {
                            text: 'Eliminar',
                            handler: () => {
                                if (treeToDelete) {
                                    handleDeleteTree(treeToDelete);
                                }
                                setTreeToDelete(null);
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
