function requirePermission(...permissions) {
    return (req, res, next) => {
        // Primero debe existir un usuario autenticado
        if (!req.usuario) {
            return res.status(401).json({
                mensaje: 'Debes iniciar sesión para continuar.'
            });
        }

        // Verificar que tenga todos los permisos requeridos
        const tienePermisos = permissions.every(permission =>
            req.usuario.permisos?.includes(permission)
        );

        if (!tienePermisos) {
            return res.status(403).json({
                mensaje: 'No tienes permisos para realizar esta acción.'
            });
        }

        next();
    };
}

function ownUserOrPermission(permission) {
    return (req, res, next) => {
        if (!req.usuario) {
            return res.status(401).json({
                mensaje: 'Debes iniciar sesión para continuar.'
            });
        }

        // Puede modificar su propio registro
        if (String(req.usuario.id_usuario) === String(req.params.id)) {
            return next();
        }

        // O debe tener el permiso indicado
        if (req.usuario.permisos?.includes(permission)) {
            return next();
        }

        return res.status(403).json({
            mensaje: 'No tienes permisos para gestionar este usuario.'
        });
    };
}

module.exports = {
    requirePermission,
    ownUserOrPermission
};