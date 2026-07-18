import AppRoutes from "./routes/AppRoutes";
import ToastContainer from "./components/ui/Toast.jsx";
import ConfirmDialogHost from "./components/ui/ConfirmDialog.jsx";

function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer />
      <ConfirmDialogHost />
    </>
  );
}

export default App;
