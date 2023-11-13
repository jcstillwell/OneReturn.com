import ReactDOM from 'react-dom';

const Portal = ({ children }) => {
  const portal = document.getElementById('popup-root');
  return ReactDOM.createPortal(children, portal);
};

export default Portal;