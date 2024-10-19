import { useHistory } from 'react-router';
import { getAuth, signOut } from 'firebase/auth';
import config from './../firebaseConfig';
const useLogout = () => {
  const history = useHistory();
  const auth = getAuth(config);
  const logout = async () => {
    try {
      await signOut(auth);
      history.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  return logout;
};
export default useLogout;