import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={styles.shell}>
      <Sidebar />
      <div style={styles.content}>
        {children}
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
    overflow: 'hidden',
    minWidth: 0,
  },
};

export default Layout;
