-- ============================================================================
-- NEXUS MANAGER — DEMO SEED DATA
-- ============================================================================

-- 1. Insert Core Users & Profiles
INSERT INTO public.profiles (id, name, email, phone, role, avatar, department, active) VALUES
('00000000-0000-0000-0000-000000000001', 'Carlos Santos', 'carlos.diretoria@nexus.com.br', '(11) 98888-0001', 'DIRECTOR', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Diretoria', true),
('00000000-0000-0000-0000-000000000002', 'Ricardo Almeida', 'ricardo.sucata@nexus.com.br', '(11) 98888-0002', 'MANAGER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Compras Sucata', true),
('00000000-0000-0000-0000-000000000003', 'Vanessa Lima', 'vanessa.vendas@nexus.com.br', '(11) 98888-0003', 'MANAGER', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Vendas Dcopper', true),
('00000000-0000-0000-0000-000000000004', 'Marcos Oliveira', 'marcos.frota@nexus.com.br', '(11) 98888-0004', 'MANAGER', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Logística / Frota', true),
('00000000-0000-0000-0000-000000000005', 'Patricia Mendes', 'patricia.controladoria@nexus.com.br', '(11) 98888-0005', 'MANAGER', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Controladoria', true),
('00000000-0000-0000-0000-000000000006', 'João Silva', 'joao.financeiro@nexus.com.br', '(11) 98888-0006', 'MANAGER', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Financeiro', true),
('00000000-0000-0000-0000-000000000007', 'Fernanda Souza', 'fernanda.fiscal@nexus.com.br', '(11) 98888-0007', 'MANAGER', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'Fiscal / Contábil', true),
('00000000-0000-0000-0000-000000000008', 'Roberto Rocha', 'roberto.seguranca@nexus.com.br', '(11) 98888-0008', 'MANAGER', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'Segurança', true),
('00000000-0000-0000-0000-000000000009', 'Ana Paula Costa', 'ana.rh@nexus.com.br', '(11) 98888-0009', 'MANAGER', 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150', 'RH', true),
('00000000-0000-0000-0000-000000000010', 'Gabriel Barbosa', 'gabriel.compras@nexus.com.br', '(11) 98888-0010', 'MANAGER', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'Compras', true),
('00000000-0000-0000-0000-000000000011', 'Beatriz Martins', 'beatriz.compliance@nexus.com.br', '(11) 98888-0011', 'MANAGER', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150', 'Compliance', true),
('00000000-0000-0000-0000-000000000000', 'Admin Nexus', 'admin@nexus.com.br', '(11) 99999-9999', 'ADMIN', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'Tecnologia & Operações', true)
ON CONFLICT (email) DO NOTHING;

-- 2. Insert 10 Areas
INSERT INTO public.areas (id, name, description, manager_id) VALUES
('10000000-0000-0000-0000-000000000001', 'Compras Sucata', 'Aquisição de sucata de cobre, alumínio e ligas metálicas.', '00000000-0000-0000-0000-000000000002'),
('10000000-0000-0000-0000-000000000002', 'Vendas Dcopper', 'Comercialização de vergalhão e arames de cobre Dcopper.', '00000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000003', 'Logística / Frota', 'Gestão de transporte, expedição e manutenção da frota.', '00000000-0000-0000-0000-000000000004'),
('10000000-0000-0000-0000-000000000004', 'Controladoria', 'Auditoria interna, DRE gerencial e margens operacionais.', '00000000-0000-0000-0000-000000000005'),
('10000000-0000-0000-0000-000000000005', 'Financeiro', 'Fluxo de caixa, tesouraria, contas a pagar e receber.', '00000000-0000-0000-0000-000000000006'),
('10000000-0000-0000-0000-000000000006', 'Fiscal / Contábil', 'Emissão de NFs, obrigações acessórias e fechamento fiscal.', '00000000-0000-0000-0000-000000000007'),
('10000000-0000-0000-0000-000000000007', 'Segurança', 'Segurança patrimonial, controle de acesso e monitoramento.', '00000000-0000-0000-0000-000000000008'),
('10000000-0000-0000-0000-000000000008', 'RH', 'Gestão de pessoas, folha de pagamento e treinamento.', '00000000-0000-0000-0000-000000000009'),
('10000000-0000-0000-0000-000000000009', 'Compras', 'Insumos industriais, peças de reposição e contratos.', '00000000-0000-0000-0000-000000000010'),
('10000000-0000-0000-0000-000000000010', 'Compliance', 'Conformidade legal, licenças ambientais e auditoria.', '00000000-0000-0000-0000-000000000011')
ON CONFLICT (name) DO NOTHING;

-- 3. Insert Today's Operational Status
INSERT INTO public.daily_status (area_id, user_id, status, justification, date) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'GREEN', NULL, CURRENT_DATE),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'GREEN', NULL, CURRENT_DATE),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004', 'YELLOW', 'Atenção registrada às 16:42 - Atraso na liberação da carreta #04 no pátio de triagem.', CURRENT_DATE),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'GREEN', NULL, CURRENT_DATE),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006', 'GREEN', NULL, CURRENT_DATE),
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000007', 'GREEN', NULL, CURRENT_DATE),
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008', 'RED', 'Ocorrência crítica registrada às 16:38 - Falha detectada no sensor perimetral do portão 3.', CURRENT_DATE),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000009', 'GREEN', NULL, CURRENT_DATE),
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000011', 'GREEN', NULL, CURRENT_DATE)
ON CONFLICT (area_id, date) DO NOTHING;

-- 4. Sample Alerts
INSERT INTO public.alerts (id, area_id, type, priority, status, title, description) VALUES
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 'CRITICAL', 'CRITICAL', 'OPEN', 'Segurança — Falha em Sensor Perimetral', 'Ocorrência crítica registrada às 16:38: Sensor perimetral do portão 3 inoperante.'),
('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'ATTENTION', 'MEDIUM', 'OPEN', 'Logística — Carreta Atrasada', 'Atenção registrada às 16:42: Atraso na liberação da carreta #04 no pátio.'),
('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000009', 'NO_RESPONSE', 'HIGH', 'OPEN', 'Compras — Sem Resposta ao Fechamento', 'Área de Compras não registrou o fechamento diário até as 17:00.')
ON CONFLICT DO NOTHING;
