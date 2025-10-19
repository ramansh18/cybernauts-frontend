import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const notifySuccess = (msg: string) =>
  toast.success(msg, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light',
    style: {
      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      color: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)',
      fontWeight: '500',
      fontSize: '14px',
      padding: '16px',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  });

export const notifyError = (msg: string) =>
  toast.error(msg, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: 'light',
    style: {
      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      color: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 8px 16px rgba(239, 68, 68, 0.25)',
      fontWeight: '500',
      fontSize: '14px',
      padding: '16px',
    },
    progressStyle: {
      background: 'rgba(255, 255, 255, 0.3)',
    },
  });

const Toast: React.FC = () => (
  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop={true}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
    style={{
      top: '24px',
      right: '24px',
    }}
  />
);

export default Toast;