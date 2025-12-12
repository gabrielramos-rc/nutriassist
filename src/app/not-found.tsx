import Link from "next/link";
import { Home, MessageSquare } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MessageSquare className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-medium text-gray-700 mb-4">Pagina nao encontrada</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          A pagina que voce esta procurando nao existe ou foi movida.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          Voltar ao inicio
        </Link>
      </div>
    </div>
  );
}
