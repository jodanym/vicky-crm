-- ============================================================
-- Vicky CRM — Datos de prueba
-- Corre esto DESPUÉS de haberte logueado al menos una vez en la app
-- para que tu perfil exista en la tabla profiles
-- ============================================================

do $$
declare
  specialist_id uuid;
begin
  -- Toma el primer usuario registrado (tú)
  select id into specialist_id from public.profiles limit 1;

  if specialist_id is null then
    raise exception 'No hay usuarios en profiles. Loguéate primero en la app.';
  end if;

  -- ----------------------------------------------------------------
  -- PRIMER CONTACTO
  -- ----------------------------------------------------------------
  insert into public.leads (full_name, email, phone, budget, development, stage, specialist_id, position, notes)
  values
    ('Carlos Mendoza',    'carlos.mendoza@gmail.com',   '+52 55 1234 5678', 1800000, 'Hama',         'primer_contacto', specialist_id, 1, 'Interesado en departamento de 2 recámaras'),
    ('Ana Guerrero',      'ana.guerrero@outlook.com',   '+52 55 9876 5432', 2500000, 'Riviera Maya',  'primer_contacto', specialist_id, 2, 'Busca propiedad de inversión'),
    ('Luis Fernández',    'luis.fernandez@hotmail.com', '+52 55 5555 4444', 900000,  'Torres del Mar','primer_contacto', specialist_id, 3, null);

  -- ----------------------------------------------------------------
  -- ENGANCHE
  -- ----------------------------------------------------------------
  insert into public.leads (full_name, email, phone, budget, development, stage, specialist_id, position, notes)
  values
    ('Jose Lopez',        'joselopez@gmail.com',        '+52 55 2222 3333', 2000000, 'Hama',         'enganche',        specialist_id, 1, 'Presupuesto aprobado, en espera de firma'),
    ('María Sánchez',     'maria.sanchez@gmail.com',    '+52 55 6666 7777', 3200000, 'Costa Azul',   'enganche',        specialist_id, 2, 'Segunda visita realizada, muy interesada');

  -- ----------------------------------------------------------------
  -- FIRMA DE CONTRATO
  -- ----------------------------------------------------------------
  insert into public.leads (full_name, email, phone, budget, development, stage, specialist_id, position, notes)
  values
    ('Roberto Díaz',      'roberto.diaz@empresa.com',   '+52 55 8888 9999', 1500000, 'Hama',         'firma_contrato',  specialist_id, 1, 'Contrato en revisión legal'),
    ('Patricia Ruiz',     'patricia.ruiz@gmail.com',    '+52 55 1111 0000', 4000000, 'Riviera Maya', 'firma_contrato',  specialist_id, 2, 'Firma programada para el viernes');

  -- ----------------------------------------------------------------
  -- CIERRE
  -- ----------------------------------------------------------------
  insert into public.leads (full_name, email, phone, budget, development, stage, specialist_id, position, notes)
  values
    ('Fernando Castro',   'fernando.castro@gmail.com',  '+52 55 3333 2222', 2200000, 'Torres del Mar','cierre',         specialist_id, 1, 'Venta cerrada. Entrega en 3 meses'),
    ('Irene Casani',      'irene.casani@gmail.com',     '+52 55 4444 1111', 1750000, 'Hama',         'cierre',          specialist_id, 2, 'Cliente satisfecha, posible referido');

  -- ----------------------------------------------------------------
  -- Actividades para Jose Lopez
  -- ----------------------------------------------------------------
  insert into public.activities (lead_id, user_id, type, body, duration_s)
  select l.id, specialist_id, 'note',         '*Cliente: Jose Lopez | Presupuesto: $2M USD | Desarrollo: Hama', null
  from public.leads l where l.full_name = 'Jose Lopez' and l.specialist_id = specialist_id limit 1;

  insert into public.activities (lead_id, user_id, type, body, duration_s)
  select l.id, specialist_id, 'call',         'Llamada registrada — 5 min', 300
  from public.leads l where l.full_name = 'Jose Lopez' and l.specialist_id = specialist_id limit 1;

  insert into public.activities (lead_id, user_id, type, body, duration_s)
  select l.id, specialist_id, 'email',        'Presupuesto enviado a joselopez@gmail.com', null
  from public.leads l where l.full_name = 'Jose Lopez' and l.specialist_id = specialist_id limit 1;

  insert into public.activities (lead_id, user_id, type, body, duration_s)
  select l.id, specialist_id, 'call',         'Llamada registrada — 15 min', 900
  from public.leads l where l.full_name = 'Jose Lopez' and l.specialist_id = specialist_id limit 1;

  insert into public.activities (lead_id, user_id, type, body, duration_s)
  select l.id, specialist_id, 'stage_change', 'Cambió de "Primer contacto" a "Enganche"', null
  from public.leads l where l.full_name = 'Jose Lopez' and l.specialist_id = specialist_id limit 1;

  raise notice 'Seed completado exitosamente para usuario %', specialist_id;
end;
$$;
