
import { AlertTriangle, Bell, Check, CheckCircle, ExternalLink, Info, XCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export const NotificationCenter = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [isDestroying, setIsDestroying] = useState<number | null>(null);
    const [isDestroyingAll, setIsDestroyingAll] = useState(false);

    useEffect(() => {
        loadData();
        // Poll every minute
        const interval = setInterval(loadData, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadData = async () => {
        try {
            const [countRes, listRes] = await Promise.all([
                api.get('/api/notifications/unread-count'),
                api.get('/api/notifications')
            ]);
            setUnreadCount(countRes.data.count);
            setNotifications(listRes.data);
        } catch (error) {
            console.error('Error loading notifications', error);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all as read', error);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('¿Estás seguro de que deseas borrar todas las notificaciones?')) return;
        try {
            setIsDestroyingAll(true);
            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 800));

            await api.delete('/api/notifications');
            setNotifications([]);
            setUnreadCount(0);
        } catch (error) {
            console.error('Error deleting all notifications', error);
        } finally {
            setIsDestroyingAll(false);
        }
    };

    const handleNotificationClick = async (n: any) => {
        if (!n.read) {
            handleMarkAsRead(n.id);
        }
        if (n.link) {
            navigate(n.link);
            setIsOpen(false);
        }
    };

    const handleDeleteSingle = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        try {
            setIsDestroying(id);
            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 600));

            await api.delete(`/api/notifications/${id}`); // Assuming this endpoint exists based on the requirement
            setNotifications(prev => prev.filter(n => n.id !== id));
            // Update unread count if we deleted an unread notification
            const deleted = notifications.find(n => n.id === id);
            if (deleted && !deleted.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification', error);
        } finally {
            setIsDestroying(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={18} className="text-orange-500" />;
            case 'error': return <XCircle size={18} className="text-red-500" />;
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="size-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-card-dark transition-colors relative outline-none"
            >
                <Bell size={20} className="text-slate-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 size-2.5 bg-red-500 rounded-full border-2 border-white dark:border-background-dark animate-pulse"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-card-dark border border-slate-200 dark:border-border-dark rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-slate-100 dark:border-border-dark flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-white">Notificaciones</h3>
                        <div className="flex items-center gap-3">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium flex items-center gap-1"
                                >
                                    <Check size={14} /> Marcar todo leído
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleDeleteAll}
                                    className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 font-medium flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined !text-[14px]">delete</span> Borrar todo
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 dark:divide-border-dark relative">
                        <style>
                            {`
                            @keyframes destroy-flicker {
                                0% { opacity: 1; transform: scale(1); filter: invert(0); }
                                20% { opacity: 0.5; transform: scale(0.98) skewX(2deg); filter: invert(0.5) sepia(1) saturate(5) hue-rotate(-50deg); }
                                40% { opacity: 1; transform: scale(1.02) skewX(-2deg); }
                                60% { opacity: 0.3; transform: scale(0.9) skewX(5deg); filter: invert(1); }
                                80% { opacity: 0.8; transform: scale(0.95); }
                                100% { opacity: 0; transform: scale(0) rotate(5deg); filter: brightness(2) contrast(2); }
                            }
                            .notification-destroying {
                                animation: destroy-flicker 0.6s forwards cubic-bezier(0.4, 0, 0.2, 1);
                                pointer-events: none;
                                z-index: 10;
                            }
                            .all-destroying {
                                animation: destroy-flicker 0.8s forwards cubic-bezier(0.4, 0, 0.2, 1);
                                pointer-events: none;
                            }
                            `}
                        </style>

                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                No tienes notificaciones
                            </div>
                        ) : (
                            <div className={isDestroyingAll ? 'all-destroying' : ''}>
                                {notifications.map(n => (
                                    <div
                                        key={n.id}
                                        className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative group ${!n.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''} ${isDestroying === n.id ? 'notification-destroying' : ''}`}
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5 shrink-0">
                                                {getIcon(n.type)}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="flex justify-between items-start">
                                                    <p className={`text-sm ${!n.read ? 'font-bold' : 'font-medium'} text-slate-800 dark:text-white`}>
                                                        {n.title}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                                                            {new Date(n.created_at).toLocaleDateString()}
                                                        </span>
                                                        <button
                                                            onClick={(e) => handleDeleteSingle(e, n.id)}
                                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 rounded transition-all"
                                                            title="Borrar"
                                                        >
                                                            <span className="material-symbols-outlined !text-[16px]">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                                    {n.message}
                                                </p>
                                                {n.link && (
                                                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                                                        Ver detalles <ExternalLink size={10} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
