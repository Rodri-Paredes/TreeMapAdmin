import React, { useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonAlert 
} from '@ionic/react';
import { useHistory } from 'react-router';
import { arrowBack, camera, checkmark } from 'ionicons/icons'; 
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';

const TreeRegister: React.FC = () => {
    const history = useHistory();
    const [treeName, setTreeName] = useState('');
    const [treeSpecies, setTreeSpecies] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [photo, setPhoto] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);

    const handleBack = () => {
        history.goBack();
    };

    const handleGetLocation = async () => {
        try {
            const coordinates = await Geolocation.getCurrentPosition();
            setLatitude(coordinates.coords.latitude.toString());
            setLongitude(coordinates.coords.longitude.toString());
        } catch (error) {
            console.error(error);
            //setAlertMessage('Error al obtener la ubicación: ' + error.message);
            setShowAlert(true);
        }
    };

    const handleTakePhoto = async () => {
        try {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
            });
            setPhoto(image.webPath || '');
        } catch (error) {
            console.error(error);
            setAlertMessage('Error al tomar la foto');
            setShowAlert(true);
        }
    };

    const resetFields = () => {
        setTreeName('');
        setTreeSpecies('');
        setLatitude('');
        setLongitude('');
        setPhoto('');
    };

    const handleSave = () => {
        // TODO: Guardar datos en la base de datos
        setAlertMessage('Árbol registrado con éxito!');
        setShowAlert(true);
        resetFields(); // Limpiar campos después de registrar
        // Llamar history.goBack() si se desea regresar a la lista
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton onClick={handleBack} fill="clear">
                            <IonIcon slot="icon-only" icon={arrowBack} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>Registrar Árbol</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave} fill="clear">
                            <IonIcon slot="icon-only" icon={checkmark} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="stacked">Nombre</IonLabel>
                    <IonInput 
                        value={treeName} 
                        onIonChange={(e) => setTreeName(e.detail.value!)} 
                        required 
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Especie</IonLabel>
                    <IonInput 
                        value={treeSpecies} 
                        onIonChange={(e) => setTreeSpecies(e.detail.value!)} 
                        required 
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Latitud</IonLabel>
                    <IonInput 
                        value={latitude} 
                        readonly 
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Longitud</IonLabel>
                    <IonInput 
                        value={longitude} 
                        readonly 
                    />
                </IonItem>
                <IonButton expand="full" onClick={handleGetLocation} style={{ margin: '10px 0' }}>
                    Obtener Ubicación Actual
                </IonButton>
                <IonItem>
                    <IonLabel>Foto</IonLabel>
                    <IonButton onClick={handleTakePhoto}>
                        <IonIcon slot="icon-only" icon={camera} />
                    </IonButton>
                </IonItem>
                {photo && (
                    <img src={photo} alt="Árbol" style={{ width: '100%', marginTop: '10px' }} />
                )}
            </IonContent>

            <IonAlert
                isOpen={showAlert}
                onDidDismiss={() => setShowAlert(false)}
                header={alertMessage.startsWith('Error') ? 'Error' : 'Éxito'}
                message={alertMessage}
                buttons={['OK']}
            />
        </IonPage>
    );
};

export default TreeRegister;
