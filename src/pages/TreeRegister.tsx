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
    const [speciesId, setSpeciesId] = useState('');
    const [diameter, setDiameter] = useState<number>(0); 
    const [sectorId, setSectorId] = useState(''); 
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [photo, setPhoto] = useState('');
    const [oldPhoto, setOldPhoto] = useState('');
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

        if (treeData) {
            setCode(treeData.code);
            setSpeciesId(treeData.speciesId);
            setDiameter(treeData.diameter);
            setSectorId(treeData.sectorId);
            setLatitude(treeData.latitude.toString());
            setLongitude(treeData.longitude.toString());
            setDateBirth(treeData.dateBirth);
            setRegisterDate(treeData.registerDate);
            setOldPhoto(treeData.imageUrl);
        }
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
            setOldPhoto('');
        } catch (error) {
            console.error(error);
            setAlertMessage('Error al tomar la foto');
            setShowAlert(true);
        }
    };

    const compressImage = async (base64String: string) => {
        try {
            // Añadir el prefijo MIME a la cadena Base64
            const imagePrefix = "data:image/jpeg;base64,";
            const fullBase64String = imagePrefix + base64String;

            // Realiza el fetch con el string Base64 completo
            const response = await fetch(fullBase64String);
            if (!response.ok) {
                throw new Error('Error al realizar fetch');
            }
            const blob = await response.blob();

            // Crear un objeto File a partir del blob
            const file = new File([blob], 'image.jpg', { type: blob.type });
    
            const options = {
                maxSizeMB: 0.5,
                maxWidthOrHeight: 800,
                useWebWorker: true,
            };
    
            // Comprimir la imagen
            const compressedFile = await imageCompression(file, options);
    
            // Convertir el archivo comprimido de nuevo a base64
            const compressedBase64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const compressedBase64 = reader.result as string;
                    resolve(compressedBase64.split(',')[1]);//No devolver el prefix o falla firebase
                };
                reader.onerror = () => reject(new Error('Error al leer el archivo comprimido'));
                reader.readAsDataURL(compressedFile);
            });
    
            return compressedBase64; // Retornar la imagen comprimida en base64
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
        setDateBirth(new Date().toISOString().split('T')[0]); // Resetear a la fecha actual
        setRegisterDate(new Date().toISOString().split('T')[0]); // Resetear a la fecha actual
    };

    const handleSave = async () => {
        if (!code || !speciesId || !dateBirth || !registerDate || !diameter || !latitude || !longitude || !sectorId || (!photo && !oldPhoto)) {
            setAlertMessage('Error: por favor, completa todos los campos requeridos.');
            setShowAlert(true);
            return; 
        }

        // Deshabilitar el botón mientras se está enviando el formulario
        setIsSubmitting(true);
        const auth = getAuth();
        const user = auth.currentUser;
        let uploadedPhotoUrl;
        if(!oldPhoto){
            uploadedPhotoUrl = await uploadPhotoToFirebase(photo);
        }else{
            uploadedPhotoUrl = oldPhoto;
        }
        const newTree  = {
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
            imageUrl: uploadedPhotoUrl,
            createdBy: user?.email
        } as Tree;

        try {
            if(treeData){
                const database = getDatabase();
                const treeRef = ref(database, `trees/${treeData.id}`);
                newTree.modifyDate = new Date().toISOString();
                await update(treeRef, newTree);
                handleBack();
            }else{
                const database = getDatabase();
                const treesRef = ref(database, 'trees');
                await push(treesRef, newTree);
            }
        } catch (error) {
            console.error("Error al guardar el árbol:", error);
            setAlertMessage('Erro al registrar el árbol')
            setShowAlert(true);
        } finally {
            // Habilitar el botón nuevamente
            setIsSubmitting(false);
        }

        console.log(newTree);
        setAlertMessage(`Arbol registrado con éxito por ${user?.displayName || user?.email}!`);
        setShowAlert(true);
        resetFields();
    };

    const generateCode = () => {
        const selectedSpecies = speciesList.find(species => species.id === speciesId);
        if (selectedSpecies) {
            // Generar código usando las 3 primeras letras del commonName y convertirlas a mayúsculas
            const letters = selectedSpecies.commonName.substring(0, 3).toUpperCase();
            
            // Función para generar 4 caracteres aleatorios (letras y números)
            const generateRandomChars = (length: number): string => {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // Letras mayúsculas y números
                let result = '';
                for (let i = 0; i < length; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    result += characters.charAt(randomIndex); // Agregar carácter aleatorio
                }
                return result;
            };
    
            // Generar 4 caracteres aleatorios
            const randomChars = generateRandomChars(4);
    
            // Combinar las letras y los caracteres aleatorios
            const code = `${letters}-${randomChars}`;
    
            setCode(code); // Asignar el código generado
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
                    <IonTitle>{(!treeData)?'Registrar Árbol':'Actualizar Árbol'}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave} fill="clear" disabled={isSubmitting}> {/* Deshabilitar el botón si está enviando */}
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
                    <IonLabel position="stacked">Código</IonLabel>
                    <IonInput 
                        value={code} 
                        onIonChange={(e) => setCode(e.detail.value!)} 
                        required 
                    />
                    <IonButton onClick={generateCode}>Generar Código</IonButton>
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
                {oldPhoto && (
                   <img src={`${oldPhoto}`} alt="Arbol" style={{ width: '100%', marginTop: '10px' }} />
                )}
            </IonContent>

            <IonLoading
                    isOpen={isSubmitting}
                    message={'Guardando...'}
            />
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
