import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon, IonSelect, IonSelectOption, IonItem, IonLabel } from '@ionic/react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useHistory } from 'react-router';
import { listSharp, logOutOutline } from 'ionicons/icons';
import useFetchTrees from '../hooks/useFetchTrees';
import config from './../firebaseConfig';
import useLogout from '../hooks/useLogout';
import { getDatabase, ref, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';

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
  const [selectedSpecies, setSelectedSpecies] = useState<string>('');
  const [speciesList, setSpeciesList] = useState<any[]>([]);

  useFetchTrees(setTrees, config);

  useEffect(() => {
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
  }, []);

  const handleViewList = () => {
    history.push('/tree-list');
  };

  const loadSpecies = async () => {
    try {
      const database = getDatabase();
      const speciesRef = ref(database, 'species');
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

  const getSpeciesColor = (speciesId: string): string => {
    const species = speciesList.find(s => s.id === speciesId);
    return species ? species.color : '#3388ff'; 
  };

  const getCustomIcon = (color: string) => {
    return L.divIcon({
      html: `<div style="background-color:${color}; width: 24px; height: 24px; border-radius: 50%;"></div>`,
      className: 'custom-marker-icon',
      iconSize: [24, 24],  // Tamaño del icono
      iconAnchor: [12, 24] // Posiciona el icono correctamente
    });
  };

  useEffect(() => {
    loadSpecies();
    const auth = getAuth(config);
    const user = auth.currentUser;
    if(!user){
        logout();
    }
  }, []);

  const filteredTrees = selectedSpecies 
    ? trees.filter(tree => tree.speciesId === selectedSpecies) 
    : trees;

  // Limites de Cochabamba
  const cochabambaBounds = [
    [-17.441, -66.325], // Suroeste
    [-17.285, -66.070]  // Noreste
  ];

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
          center={[-17.393838, -66.157061]}
          zoom={18}
          scrollWheelZoom={true}
          style={{ height: '100vh', width: '100vw' }}
          maxBounds={cochabambaBounds} // Limitar el área visible al área de Cochabamba
          maxBoundsViscosity={1.0} // Restringe completamente el área
          minZoom={13} // Ajusta el zoom mínimo para que no se aleje demasiado
          maxZoom={22} // Ajusta el zoom máximo para un mejor enfoque en la región
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {filteredTrees.map((tree, index) => {
            const speciesColor = getSpeciesColor(tree.speciesId);
            return (
              <Marker
                key={index}
                position={[tree.latitude, tree.longitude]}
                icon={getCustomIcon(speciesColor)}
              >
                <Popup>
                  <strong>{tree.code}</strong> ({tree.species?.commonName})<br />
                  <img src={tree.imageUrl} alt={tree.code} style={{ width: '100px' }} />
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
