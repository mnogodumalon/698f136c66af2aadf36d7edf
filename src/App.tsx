import './App.css'
import Dashboard from '@/pages/Dashboard'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <>
      <Dashboard />
      <Toaster richColors />
    </>
  );
}

export default App
