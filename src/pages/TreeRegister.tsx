import React, { useState, useEffect } from 'react';
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
  IonDatetime,
  IonSelect,
  IonSelectOption 
} from '@ionic/react';
import { useHistory } from 'react-router';
import { arrowBack, camera, checkmark } from 'ionicons/icons'; 
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { getDatabase, ref, get, push } from 'firebase/database';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';

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
    const [dateBirth, setDateBirth] = useState<string>(new Date().toISOString().split('T')[0]); // Valor por defecto
    const [registerDate, setRegisterDate] = useState<string>(new Date().toISOString().split('T')[0]); // Valor por defecto

    const [speciesList, setSpeciesList] = useState<any[]>([]);
    const [sectorsList, setSectorsList] = useState<any[]>([]);
    
    // Nuevo estado para controlar el envío del formulario
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadSpecies();
        loadSectors();
    }, []);
    
    useEffect(() => {
        // Establecer el valor por defecto para speciesId
        if (speciesList.length > 0) {
            setSpeciesId(speciesList[0].id); // Seleccionar la primera especie como valor por defecto
        }
    }, [speciesList]);
    
    useEffect(() => {
        // Establecer el valor por defecto para sectorId
        if (sectorsList.length > 0) {
            setSectorId(sectorsList[0].id); // Seleccionar el primer sector como valor por defecto
        }
    }, [sectorsList]);

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

    const loadSectors = async () => {
        try {
            const database = getDatabase();
            const sectorsRef = ref(database, 'sectors');
            const snapshot = await get(sectorsRef);
            
            if (snapshot.exists()) {
                const sectorsData = snapshot.val();
                const sectorsArray = Object.keys(sectorsData).map(key => ({
                    id: key,
                    ...sectorsData[key]
                }));
                setSectorsList(sectorsArray);
            }
        } catch (error) {
            console.error("Error al cargar los sectores:", error);
        }
    };

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
                resultType: CameraResultType.Base64,
            });
            setPhoto(image.base64String || '');
        } catch (error) {
            console.error(error);
            setAlertMessage('Error al tomar la foto');
            setShowAlert(true);
        }
    };

    const uploadPhotoToFirebase = async (base64String: string) => {
        try {
            const storage = getStorage();
            const photoRef = storageRef(storage, `trees/${new Date().getTime()}.jpg`);
            await uploadString(photoRef, base64String, 'base64');
            const url = await getDownloadURL(photoRef);
            return url;
        } catch (error) {
            console.error('Error al subir la foto:', error);
            throw new Error('Error al subir la foto a Firebase Storage');
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
        setDateBirth(new Date().toISOString().split('T')[0]); // Resetear a la fecha actual
        setRegisterDate(new Date().toISOString().split('T')[0]); // Resetear a la fecha actual
    };

    const handleSave = async () => {
        if (!code || !speciesId || !dateBirth || !registerDate || !diameter || !latitude || !longitude || !sectorId || !photo) {
            setAlertMessage('Error: por favor, completa todos los campos requeridos.');
            setShowAlert(true);
            return; 
        }

        // Deshabilitar el botón mientras se está enviando el formulario
        setIsSubmitting(true);

        const uploadedPhotoUrl = await uploadPhotoToFirebase(photo);
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
            imageUrl: uploadedPhotoUrl
        };

        try {
            const database = getDatabase();
            const treesRef = ref(database, 'trees');
            await push(treesRef, newTree);
        } catch (error) {
            console.error("Error al guardar el árbol:", error);
            setAlertMessage('Error al registrar el árbol: ' + error.message);
            setShowAlert(true);
        } finally {
            // Habilitar el botón nuevamente
            setIsSubmitting(false);
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
                        <IonButton onClick={handleSave} fill="clear" disabled={isSubmitting}> {/* Deshabilitar el botón si está enviando */}
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
                    <IonLabel position="stacked">Especie</IonLabel>
                    <IonSelect
                        value={speciesId}
                        onIonChange={(e) => setSpeciesId(e.detail.value!)}
                        required
                    >
                        {speciesList.map(species => (
                            <IonSelectOption key={species.id} value={species.id}>
                                {species.commonName}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
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
                    <IonLabel position="stacked">Sector</IonLabel>
                    <IonSelect
                        value={sectorId}
                        onIonChange={(e) => setSectorId(e.detail.value!)}
                        required
                    >
                        {sectorsList.map(sector => (
                            <IonSelectOption key={sector.id} value={sector.id}>
                                {sector.name} 
                            </IonSelectOption>
                        ))}
                    </IonSelect>
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
                   <img src={`data:image/jpeg;base64,${photo}`} alt="Arbol" style={{ width: '100%', marginTop: '10px' }} />
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
