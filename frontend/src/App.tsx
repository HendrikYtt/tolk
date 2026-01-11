// Tolk Frontend App
import { Toaster } from 'react-hot-toast';
import { Header } from './components/ui';
import { TranscriberPage } from './pages';

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-1 overflow-hidden">{children}</main>
        </div>
    );
}

export default function App() {
    return (
        <>
            <Toaster
                position="top-center"
                toastOptions={{
                    className: 'text-sm',
                    duration: 3000,
                }}
            />
            <Layout>
                <TranscriberPage />
            </Layout>
        </>
    );
}
