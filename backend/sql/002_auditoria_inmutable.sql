BEGIN;

-- La auditoria es append-only: los eventos existentes no se pueden modificar ni borrar.
CREATE OR REPLACE FUNCTION public.rechazar_cambio_auditoria()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
BEGIN
    RAISE EXCEPTION 'Los registros de auditoria son inmutables.'
        USING ERRCODE = '42501';
END;
$$;

REVOKE ALL ON FUNCTION public.rechazar_cambio_auditoria() FROM PUBLIC;

DROP TRIGGER IF EXISTS auditoria_inmutable ON public.auditoria;
CREATE TRIGGER auditoria_inmutable
    BEFORE UPDATE OR DELETE ON public.auditoria
    FOR EACH ROW
    EXECUTE FUNCTION public.rechazar_cambio_auditoria();

COMMENT ON TABLE public.auditoria IS
    'Registro append-only: la aplicacion solo agrega eventos y los usuarios autorizados los consultan.';

COMMIT;
