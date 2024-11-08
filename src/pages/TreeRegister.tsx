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
  IonSelect,
  IonSelectOption,
  IonLoading
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router';
import { arrowBack, camera, checkmark } from 'ionicons/icons'; 
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { getDatabase, ref, get, push, update } from 'firebase/database';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import imageCompression from 'browser-image-compression';

interface TreeRegisterProps {
    treeData?: Tree;
}

const TreeRegister: React.FC<TreeRegisterProps> = () => {
    const location = useLocation<TreeRegisterProps>();
    const treeData = location.state?.treeData;
    const history = useHistory();
    const [code, setCode] = useState('');
    const [speciesId, setSpeciesId] = useState(treeData?.speciesId || '');  // Initialize with treeData speciesId if available
    const [diameter, setDiameter] = useState<number>(0); 
    const [sectorId, setSectorId] = useState(treeData?.sectorId || '');  // Initialize with treeData sectorId if available
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [photo, setPhoto] = useState('');
    const [oldPhoto, setOldPhoto] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [registerDate, setRegisterDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [speciesList, setSpeciesList] = useState<any[]>([]);
    const [sectorsList, setSectorsList] = useState<any[]>([]);
    const [isCodeGenerated, setIsCodeGenerated] = useState(false);
    const [address, setAddress] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadSpecies();
        loadSectors();

        if (treeData) {
            setCode(treeData.code);
            setDiameter(treeData.diameter);
            setLatitude(treeData.latitude.toString());
            setLongitude(treeData.longitude.toString());
            setRegisterDate(treeData.registerDate);
            setOldPhoto(treeData.imageUrl);
            setAddress(treeData.address);
        }
    }, []);

    useEffect(() => {
        if (speciesList.length > 0 && !treeData) {
            setSpeciesId(speciesList[0].id); // Default species if not editing
        }
    }, [speciesList]);
    
    useEffect(() => {
        if (sectorsList.length > 0 && !treeData) {
            setSectorId(sectorsList[0].id); // Default sector if not editing
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
            const coordinates = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
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
            setOldPhoto('');
        } catch (error) {
            console.error(error);
            setAlertMessage('Error al tomar la foto');
            setShowAlert(true);
        }
    };

    const compressImage = async (base64String: string) => {
        try {
            const imagePrefix = "data:image/jpeg;base64,";
            const fullBase64String = imagePrefix + base64String;

            const response = await fetch(fullBase64String);
            if (!response.ok) {
                throw new Error('Error al realizar fetch');
            }
            const blob = await response.blob();

            const file = new File([blob], 'image.jpg', { type: blob.type });
    
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };
    
            const compressedFile = await imageCompression(file, options);
    
            const compressedBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const compressedBase64 = reader.result as string;
                    resolve(compressedBase64.split(',')[1]);
                };
                reader.onerror = () => reject(new Error('Error al leer el archivo comprimido'));
                reader.readAsDataURL(compressedFile);
            });
    
            return compressedBase64;
        } catch (error) {
            console.error('Error al comprimir la imagen:', error);
            throw new Error('Error al comprimir la imagen');
        }
    };

    const uploadPhotoToFirebase = async (base64String: string) => {
        if(!base64String){
            return '';
        }

        try {
            const compressedBase64 = await compressImage(base64String);
            const storage = getStorage();
            const photoRef = storageRef(storage, `trees/${new Date().getTime()}.jpg`);
            if (typeof compressedBase64 !== 'string') {
                throw new Error('La imagen comprimida no es un string válido.');
            }
            await uploadString(photoRef, compressedBase64, 'base64');
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
        setAddress('');
    };

    const handleSave = async () => {
        const registerDate = new Date().toISOString();
        if (!speciesId || !registerDate || !diameter || !latitude || !longitude || !sectorId || (!photo && !oldPhoto)) {
            setAlertMessage('Error: por favor, completa todos los campos requeridos.');
            setShowAlert(true);
            return; 
        }

        setIsSubmitting(true);
        const auth = getAuth();
        const user = auth.currentUser;
        let uploadedPhotoUrl;
        
        try {
            if (!oldPhoto) {
                uploadedPhotoUrl = await uploadPhotoToFirebase(photo);
            } else {
                uploadedPhotoUrl = oldPhoto;
            }
            const newTree = {
                speciesId,
                code,
                registerDate,
                diameter,
                deleteDate: '',
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                modifyDate: '',
                sectorId,
                imageUrl: uploadedPhotoUrl,
                createdBy: user?.email,
                address
            } as Tree;

            const database = getDatabase();

            if (treeData) {
                const treeRef = ref(database, `trees/${treeData.id}`);
                newTree.modifyDate = new Date().toISOString();
                await update(treeRef, newTree);
            } else {
                const treesRef = ref(database, 'trees');
                await push(treesRef, newTree);
            }

            setAlertMessage(`Árbol registrado con éxito por ${user?.displayName || user?.email}!`);
            resetFields();
            handleBack();

        } catch (error) {
            console.error("Error al guardar el árbol:", error);
            setAlertMessage('Error al registrar el árbol');
            setShowAlert(true);
        } finally {
            setIsSubmitting(false);
        }
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
                    <IonTitle>{(!treeData) ? 'Registrar Árbol' : 'Actualizar Árbol'}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave} fill="clear" disabled={isSubmitting}>
                            <IonIcon slot="icon-only" icon={checkmark} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding">
                <IonItem>
                    <IonLabel position="stacked">Especie</IonLabel>
                    <IonSelect
                        value={speciesId}
                        onIonChange={(e) => setSpeciesId(e.detail.value!)}
                    >
                        {speciesList.map(species => (
                            <IonSelectOption key={species.id} value={species.id}>
                                {species.commonName}
                            </IonSelectOption>
                        ))}
                    </IonSelect>
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Sector</IonLabel>
                    <IonSelect
                        value={sectorId}
                        onIonChange={(e) => setSectorId(e.detail.value!)}
                    >
                        {sectorsList.map(sector => (
                            <IonSelectOption key={sector.id} value={sector.id}>
                                {sector.name} 
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
                    <IonLabel position="stacked">Código</IonLabel>
                    <IonInput
                        value={code}
                        onIonChange={(e) => !isCodeGenerated && setCode(e.detail.value!)}
                        required
                        disabled={isCodeGenerated}
                        readonly
                    />
                </IonItem>
                <IonItem>
                    <IonLabel position="stacked">Dirección</IonLabel>
                    <IonInput
                        value={address}
                        readonly
                    />
                </IonItem>

                {treeData && (
                    <IonItem>
                        <IonLabel position="stacked">Fecha de Registro</IonLabel>
                        <IonLabel>{new Date(registerDate).toLocaleDateString()}</IonLabel>
                    </IonItem>
                )}

                <IonItem>
                    <IonLabel>Foto</IonLabel>
                    <IonButton onClick={handleTakePhoto}>
                        <IonIcon slot="icon-only" icon={camera} />
                    </IonButton>
                </IonItem>
                {photo && (
                   <img src={`data:image/jpeg;base64,${photo}`} alt="Árbol" style={{ width: '100%', marginTop: '10px' }} />
                )}
                {oldPhoto && (
                   <img src={`${oldPhoto}`} alt="Árbol" style={{ width: '100%', marginTop: '10px' }} />
                )}
            </IonContent>

            <IonLoading isOpen={isSubmitting} message={'Guardando...'} />
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
