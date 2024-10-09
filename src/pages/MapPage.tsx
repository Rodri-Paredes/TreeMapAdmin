import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, IonSelect, IonSelectOption, IonItem, IonLabel } from '@ionic/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useHistory } from 'react-router';
import { listSharp, logOutOutline } from 'ionicons/icons';
import useFetchTrees from '../hooks/useFetchTrees';
import config from './../firebaseConfig';
import useLogout from '../hooks/useLogout';
import { getDatabase, ref, get } from 'firebase/database';

// Configuración de iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPage: React.FC = () => {
  const history = useHistory();
  const logout = useLogout();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState<string>(''); // Especie seleccionada
  const [speciesList, setSpeciesList] = useState<any[]>([]); // Lista de especies

  useFetchTrees(setTrees, config);

  useEffect(() => {
    // Simular un cambio de tamaño de pantalla para manejar el problema con el mapa
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
  }, []);

  const handleViewList = () => {
    history.push('/tree-list');  // Cambia la ruta a "tree-list"
  };

  // Función para cargar las especies desde Firebase
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

  // Filtrar árboles por especie
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
          <IonTitle>Mapa de Árboles</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleViewList} fill="clear" size="small">
              <IonIcon slot="icon-only" icon={listSharp} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent style={{ padding: 0 }}>
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

        <MapContainer 
          center={[-17.331362, -66.226066]}
          zoom={16}
          scrollWheelZoom={true}
          style={{ height: '100vh', width: '100vw' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredTrees.map((tree, index) => (
            <Marker key={index} position={[tree.latitude, tree.longitude]}>
              <Popup>
                <strong>{tree.code}</strong> ({tree.species?.commonName})<br />
                <img src={tree.imageUrl} alt={tree.code} style={{ width: '100px' }} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
