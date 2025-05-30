import './App.css'
import { Outlet } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="App flex flex-col min-h-screen w-full p-0 m-0">
      <Navbar />
      <main className="w-full flex-1 p-0">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
export default App;
