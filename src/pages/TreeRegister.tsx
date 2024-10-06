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
  IonAlert,
  IonDatetime
} from '@ionic/react';
import { useHistory } from 'react-router';
import { arrowBack, camera, checkmark } from 'ionicons/icons'; 
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { getDatabase, push, ref } from 'firebase/database';

const TreeRegister: React.FC = () => {
    const history = useHistory();
    const [code, setCode] = useState('');
    const [speciesId, setSpeciesId] = useState('');
    const [diameter, setDiameter] = useState<number>(0); 
    const [sectorId, setSectorId] = useState(''); 
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [photo, setPhoto] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [dateBirth, setDateBirth] = useState<string>('');
    const [registerDate, setRegisterDate] = useState<string>('');

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
            setAlertMessage('Error al obtener la ubicación');
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
        setCode('');
        setSpeciesId('');
        setDiameter(0);
        setSectorId('');
        setLatitude('');
        setLongitude('');
        setPhoto('');
        setDateBirth('');
        setRegisterDate('');
    };

    const handleSave = async () => {
        if (!code || !speciesId || !dateBirth || !registerDate || !diameter || !latitude || !longitude || !sectorId || !photo) {
            setAlertMessage('Error por favor, completa todos los campos requeridos.');
            setShowAlert(true);
            return; 
        }
        const newTree: Tree = {
            speciesId,
            code,
            dateBirth,
            registerDate,
            diameter,
            deleteDate: '',
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            modifyDate: '',
            sectorId,
            imageUrl: photo
        };
        try {
            const database = getDatabase();
            const treesRef = ref(database, 'trees');
            await push(treesRef, newTree);
        } catch (error) {
            console.error("Error al guardar el arbol:", error);
            setAlertMessage('Error al registrar el arbol: ' + error.message);
            setShowAlert(true);
        }

        console.log(newTree);
        setAlertMessage('Árbol registrado con éxito!');
        setShowAlert(true);
        resetFields();
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
                    <IonLabel position="stacked">Código</IonLabel>
                    <IonInput 
                        value={code} 
                        onIonChange={(e) => setCode(e.detail.value!)} 
                        required 
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Especie ID</IonLabel>
                    <IonInput 
                        value={speciesId} 
                        onIonChange={(e) => setSpeciesId(e.detail.value!)} 
                        required 
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Diámetro (cm)</IonLabel>
                    <IonInput 
                        type="number" 
                        value={diameter} 
                        onIonChange={(e) => setDiameter(parseFloat(e.detail.value!))} 
                        required 
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Sector ID</IonLabel>
                    <IonInput 
                        value={sectorId} 
                        onIonChange={(e) => setSectorId(e.detail.value!)} 
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
                    <IonLabel position="stacked">Fecha de Nacimiento</IonLabel>
                    <IonDatetime 
                        presentation="date" 
                        value={dateBirth} 
                        onIonChange={(e) => setDateBirth(e.detail.value!)} 
                        preferWheel={true}
                    />
                </IonItem>

                <IonItem>
                    <IonLabel position="stacked">Fecha de Registro</IonLabel>
                    <IonDatetime 
                        presentation="date" 
                        value={registerDate} 
                        onIonChange={(e) => setRegisterDate(e.detail.value!)} 
                        preferWheel={true}
                    />
                </IonItem>

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
