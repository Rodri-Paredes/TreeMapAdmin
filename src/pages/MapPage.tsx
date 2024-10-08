import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon } from '@ionic/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useHistory } from 'react-router';
import { listSharp, logOutOutline } from 'ionicons/icons';
import useFetchTrees from '../hooks/useFetchTrees';
import config from './../firebaseConfig';
import useLogout from '../hooks/useLogout';

// Configuración de iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPage: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    // Simular un cambio de tamaño de pantalla para manejar el problema con el mapa
    const resizeEvent = new Event('resize');
    window.dispatchEvent(resizeEvent);
  }, []);

  const handleViewList = () => {
    history.push('/tree-list');  // Cambia la ruta a "tree-list"
  };
  const logout = useLogout();
  const [trees, setTrees] = useState<Tree[]>([]);
  useFetchTrees(setTrees,config)
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
          {trees.map((tree, index) => (
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
