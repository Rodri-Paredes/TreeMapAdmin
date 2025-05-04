import { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';
import TreeList from './pages/TreeList';
import MapPage from './pages/MapPage';
import TreeRegister from './pages/TreeRegister';
import Login from './pages/Login';
import Statistics from './pages/Statistics';
import RegisterTree from './pages/RegisterAccount';

/* Firebase */
import app from './firebaseConfig';
import { getDatabase, ref, get } from 'firebase/database';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        console.log('Permiso de notificación:', permission);
      });
    }

    const db = getDatabase(app);

    const getTrees = async () => {
      const snapshot = await get(ref(db, "trees"));
      const data = snapshot.val();

      const frecuencias: { id: string; dias: number }[] = [];

      for (const id in data) {
        const watering = data[id].watering;
        const diasMatch = watering?.match(/\d+/);
        if (diasMatch) {
          frecuencias.push({
            id,
            dias: parseInt(diasMatch[0])
          });
        }
      }

      return frecuencias;
    };

    const setupTreeNotifications = async () => {
      const trees = await getTrees();

      trees.forEach(tree => {
        const ms = tree.dias * 24 * 60 * 60 * 1000;

        setInterval(() => {
          if (Notification.permission === 'granted') {
            const notification = new Notification(`🌿 Árbol ${tree.id}`, {
              body: `¡Hora de regarlo! Se riega cada ${tree.dias} días.`,
              icon: '/assets/icon/favicon.png'
            });

            notification.onclick = () => {
              window.focus();
              window.location.href = '/map';
            };
          }
        }, ms);
      });
    };

    setupTreeNotifications();

    const interval = setInterval(() => {
      if (Notification.permission === 'granted') {
        const notification = new Notification('🌳 ¡Hora de regar un árbol!', {
          body: 'Recuerda regar un árbol en tu área.',
          icon: '/assets/icon/favicon.png'
        });

        notification.onclick = () => {
          window.focus();
          window.location.href = '/map';
        };
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/tree-list">
            <TreeList />
          </Route>
          <Route path="/login" component={Login} exact />
          <Route exact path="/map">
            <MapPage />
          </Route>
          <Route exact path="/tree-register">
            <TreeRegister />
          </Route>
          <Route path="/statistics" component={Statistics} exact />
          <Route path="/register" component={RegisterTree} exact />
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
