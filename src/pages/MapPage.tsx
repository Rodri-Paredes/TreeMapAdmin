import React, { useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonIcon } from '@ionic/react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useHistory } from 'react-router';
import { listSharp } from 'ionicons/icons';

// Configuración de iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Datos de árboles
const trees = [
  {
    name: 'Tajibo',
    species: 'Handroanthus Abayoy',
    latitude: -17.369668,
    longitude: -66.168309,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/treemap-de6cf.appspot.com/o/tajibo.jpeg?alt=media&token=9fdfbc29-ba8c-45b8-9992-abd0c0a0e9cd'
  },
  {
    name: 'Tipuana',
    species: 'Árbol semi-caducifolio y alóctono',
    latitude: -17.368900,
    longitude: -66.168450,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/treemap-de6cf.appspot.com/o/tipuana.jpeg?alt=media&token=edc51831-0861-438d-842c-59d7e954e8ea'
  },
  {
    name: 'Pacay',
    species: 'árbol mimosáceo de la familia de las leguminosas',
    latitude: -17.369100,
    longitude: -66.167800,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/treemap-de6cf.appspot.com/o/Pacay.jpg?alt=media&token=cf71c1f6-7ebb-43c2-91cd-04fdee5854f2'
  },
  {
    name: 'Jacaranda',
    species: 'Árbol subtropical de la familia Bignoniaceae oriundo de Sudamérica',
    latitude: -17.370200,
    longitude: -66.169200,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/treemap-de6cf.appspot.com/o/jacaranda.jpg?alt=media&token=2f18366d-5b48-4703-b27c-07707be81ae8'
  },
  {
    name: 'Alamo',
    species: 'El álamo recibe el nombre científico Populus alba',
    latitude: -17.368500,
    longitude: -66.170000,
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/treemap-de6cf.appspot.com/o/Alamo.jpg?alt=media&token=6ef5dbee-3428-4677-b4f0-7f1832478e9f'
  }
];

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

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
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
          center={[-17.369668, -66.168309]}
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
                <strong>{tree.name}</strong> ({tree.species})<br />
                <img src={tree.imageUrl} alt={tree.name} style={{ width: '100px' }} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
