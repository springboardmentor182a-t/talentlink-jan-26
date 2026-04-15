import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div style={styles.shell}>
      <Sidebar />
      <div style={styles.content}>
        <Outlet />                           
      </div>
    </div>
  );
};

const styles = {
  shell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    minWidth: 0,
  },
};

export default Layout;