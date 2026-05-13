import { useLocation, Link } from 'react-router-dom';
import { CircleDot } from 'lucide-react';

export default function PageNotFound() {
    const location = useLocation();
    
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <CircleDot className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-6xl font-heading font-bold text-gradient mb-2">404</h1>
                    <p className="text-muted-foreground">
                        Halaman <span className="text-foreground font-medium">"{location.pathname}"</span> tidak ditemukan.
                    </p>
                </div>
                <Link
                    to="/"
                    className="inline-flex items-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold hover:bg-primary/80 transition-colors"
                >
                    ← Kembali ke Dashboard
                </Link>
            </div>
        </div>
    )
}