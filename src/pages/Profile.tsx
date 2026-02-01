import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Mail, Loader2, ArrowLeft, Edit2, Check, X, Image } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function Profile() {
    const { user, profile, updateProfile, signOut, loading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editFullName, setEditFullName] = useState('');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    // Initialize edit fields when profile loads or editing starts
    useEffect(() => {
        if (profile) {
            setEditFullName(profile.full_name || '');
            setEditAvatarUrl(profile.avatar_url || '');
        }
    }, [profile, isEditing]);

    const handleSaveChanges = async () => {
        if (!editFullName.trim()) {
            toast({
                title: 'Campo requerido',
                description: 'El nombre es obligatorio',
                variant: 'destructive',
            });
            return;
        }

        try {
            setIsSaving(true);
            const { error } = await updateProfile(
                editFullName.trim(),
                editAvatarUrl.trim() || null
            );

            if (error) {
                toast({
                    title: 'Error al guardar',
                    description: error.message,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Perfil actualizado',
                    description: 'Tus cambios se guardaron correctamente',
                });
                setIsEditing(false);
            }
        } catch (error) {
            toast({
                title: 'Error inesperado',
                description: 'No se pudieron guardar los cambios',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset to current values
        if (profile) {
            setEditFullName(profile.full_name || '');
            setEditAvatarUrl(profile.avatar_url || '');
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut();
            toast({
                title: 'Sesión cerrada',
                description: 'Hasta pronto',
            });
            navigate('/login');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'No se pudo cerrar la sesión',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const displayName = profile?.full_name || user.email?.split('@')[0] || 'Usuario';
    const avatarUrl = profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff&size=200`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-20">
            {/* Header */}
            <div className="bg-card border-b border-border">
                <div className="max-w-2xl mx-auto px-4 py-6 flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="hover:bg-muted"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-foreground flex-1">Mi Perfil</h1>
                    {!isEditing && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Editar
                        </Button>
                    )}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative mb-4">
                            <img
                                src={isEditing && editAvatarUrl ? editAvatarUrl : avatarUrl}
                                alt={displayName}
                                className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
                                onError={(e) => {
                                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff&size=200`;
                                }}
                            />
                            {!isEditing && (
                                <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 ring-4 ring-card" />
                            )}
                        </div>

                        {isEditing ? (
                            <div className="w-full space-y-3">
                                <div className="relative">
                                    <Image className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="url"
                                        placeholder="URL de avatar (opcional)"
                                        value={editAvatarUrl}
                                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                                        disabled={isSaving}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        ) : (
                            <h2 className="text-2xl font-bold text-foreground text-center">{displayName}</h2>
                        )}
                    </div>

                    {/* Info Sections */}
                    <div className="space-y-4">
                        {/* Full Name */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Nombre completo</p>
                                {isEditing ? (
                                    <Input
                                        type="text"
                                        value={editFullName}
                                        onChange={(e) => setEditFullName(e.target.value)}
                                        disabled={isSaving}
                                        className="h-8 mt-1"
                                    />
                                ) : (
                                    <p className="text-sm font-medium text-foreground">{profile?.full_name || 'No establecido'}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Mail className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Correo electrónico</p>
                                <p className="text-sm font-medium text-foreground">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Edit Actions */}
                    {isEditing && (
                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                                className="flex-1"
                            >
                                {isSaving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="mr-2 h-4 w-4" />
                                )}
                                Guardar Cambios
                            </Button>
                            <Button
                                onClick={handleCancelEdit}
                                disabled={isSaving}
                                variant="outline"
                                className="flex-1"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>
                        </div>
                    )}
                </motion.div>

                {/* Account Info */}
                {!isEditing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                    >
                        <h3 className="text-lg font-semibold text-foreground mb-4">Información de cuenta</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">ID de usuario</span>
                                <span className="text-foreground font-mono text-xs">{user.id.slice(0, 8)}...</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Sign Out Button */}
                {!isEditing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <Button
                            onClick={handleSignOut}
                            variant="outline"
                            className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                            <LogOut className="mr-2 h-5 w-5" />
                            Cerrar Sesión
                        </Button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
