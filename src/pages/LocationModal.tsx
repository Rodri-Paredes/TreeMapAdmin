import React, { useEffect, useState } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent } from '@ionic/react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const LocationPicker: React.FC<{
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, lng: number) => void;
  }> = ({ latitude, longitude, onLocationChange }) => {
    const [position, setPosition] = useState<L.LatLngExpression>([latitude, longitude]);
  
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onLocationChange(e.latlng.lat, e.latlng.lng);
      }
    });
  
    return (
      <Marker
        position={position}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const newPos = marker.getLatLng();
            setPosition([newPos.lat, newPos.lng]);
            onLocationChange(newPos.lat, newPos.lng);
          }
        }}
      />
    );
  };
type LocationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialCoords: [number, number];
  onSelectLocation: (lat: number, lng: number) => void;
};

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  initialCoords,
  onSelectLocation,
}) => {

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}
    onDidPresent={() => {
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 300);
      }}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Seleccionar ubicación</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cerrar</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <MapContainer center={initialCoords} zoom={18} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker
            latitude={initialCoords[0]}
            longitude={initialCoords[1]}
            onLocationChange={onSelectLocation}
          />
        </MapContainer>
      </IonContent>
    </IonModal>
  );
};

export default LocationModal;
