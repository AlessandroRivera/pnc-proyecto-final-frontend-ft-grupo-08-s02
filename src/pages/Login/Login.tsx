import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { User, Lock } from 'lucide-react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import img1 from '../../assets/login/DEI.jpg';
import img2 from '../../assets/login/Edificio.jpg';
import img3 from '../../assets/login/Mural.jpg';

interface FormValues {
    email: string;
    password: string;
}

const slides = [
    {
        image: img1,
        title: '¡Bienvenido a REHOSAR!',
        description: 'Inicia sesión y gestiona tus actividades fácilmente.',
    },
    {
        image: img2,
        title: 'Registra tus horas',
        description: 'Lleva el control de tu tiempo con eficiencia.',
    },
    {
        image: img3,
        title: 'Aprende y colabora',
        description: 'Comparte tus logros con otros estudiantes.',
    },
];

const Login: React.FC = () => {
    const [values, setValues] = useState<FormValues>({ email: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signin } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues(v => ({ ...v, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await signin({ email: values.email.trim(), password: values.password });
            // signin() ya hace navigate al dashboard
        } catch (err: any) {
            setError(err.response?.data?.message || 'Credenciales inválidas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row font-sans">
            {/* Carrusel - lado izquierdo */}
            <div className="relative hidden lg:flex lg:w-[55%] bg-black shadow-xl">
                <Carousel
                    autoPlay
                    infiniteLoop
                    showThumbs={false}
                    showStatus={false}
                    interval={5000}
                    showArrows={false}
                    swipeable
                    className="w-full h-screen"
                >
                    {slides.map((slide, i) => (
                        <div key={i} className="relative w-full h-full">
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="object-cover w-full h-screen opacity-75"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="text-white text-center px-8 max-w-xl animate-fadeInUp">
                                    <h2 className="text-5xl font-bold mb-4 drop-shadow-lg">{slide.title}</h2>
                                    <p className="text-lg drop-shadow text-gray-200">{slide.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </Carousel>
            </div>

            {/* Panel de Login */}
            <div className="flex w-full lg:w-[45%] items-center justify-center p-6 bg-gray-50">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl space-y-8 animate-fadeIn">
                    {/* Header del formulario */}
                    <div className="text-center space-y-2">
                        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-[#003c71] to-[#00509e] flex items-center justify-center shadow-md">
                            <User className="text-white" size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Iniciar sesión</h1>
                        <p className="text-sm text-gray-500">
                            Accede a tu cuenta para comenzar a usar <strong>REHOSAR</strong>
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-100 text-red-600 p-2 rounded text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email completo */}
                        <div className="relative flex items-center">
                            <User className="absolute left-3 text-gray-400" size={20} />
                            <input
                                type="email"
                                name="email"
                                value={values.email}
                                onChange={handleChange}
                                required
                                placeholder="Correo electrónico"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003c71] shadow-sm"
                            />
                        </div>

                        {/* Contraseña */}
                        <div className="relative">
                            <Lock
                                className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                type="password"
                                name="password"
                                value={values.password}
                                onChange={handleChange}
                                required
                                placeholder="Contraseña"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003c71] shadow-sm"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#003c71] to-[#00509e] hover:opacity-90 text-white py-2 rounded-xl font-semibold transition disabled:opacity-50 shadow"
                        >
                            {loading ? 'Iniciando...' : 'Iniciar sesión'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;