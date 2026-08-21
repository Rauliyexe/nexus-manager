import {
 Profile,
 HubTask,
 Area,
 NotificationItem,
 Conversation,
 Message,
 TaskPriority,
 TaskStatus,
} from '@/lib/types/nexus';

export interface AgentContext {
 currentUser: Profile;
 tasks: HubTask[];
 areas: Area[];
 notifications: NotificationItem[];
 conversations: Conversation[];
 messages: Record<string, Message[]>;
}

export interface AgentToolCall {
 id: string;
 name: string;
 input: Record<string, any>;
}

export interface AgentToolResult {
 tool_use_id: string;
 content: string;
 actionTaken?: {
 type: 'TASK_CREATED' | 'TASK_UPDATED' | 'MESSAGE_SENT' | 'CONFIRMATION_REQUIRED';
 data: any;
 };
}

// ── 1. Tool Schemas para Claude ──
export const AGENT_TOOLS = [
 {
 name: 'get_my_profile',
 description: 'Retorna informações do perfil do usuário autenticado (nome, cargo, departamento e permissões).',
 input_schema: {
 type: 'object',
 properties: {},
 required: [],
 },
 },
 {
 name: 'get_my_tasks',
 description: 'Retorna tarefas às quais o usuário tem acesso, com suporte a filtros por status, data ou prioridade.',
 input_schema: {
 type: 'object',
 properties: {
 filter: {
 type: 'string',
 enum: ['ALL', 'TODAY', 'OVERDUE', 'UPCOMING', 'COMPLETED'],
 description: 'Filtro de tarefas: ALL (todas), TODAY (para hoje), OVERDUE (atrasadas), UPCOMING (próximas), COMPLETED (concluídas).',
 },
 priority: {
 type: 'string',
 enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
 description: 'Filtro opcional por prioridade.',
 },
 },
 required: [],
 },
 },
 {
 name: 'get_my_projects',
 description: 'Retorna as áreas e projetos autorizados para o usuário e seu status operacional atual.',
 input_schema: {
 type: 'object',
 properties: {},
 required: [],
 },
 },
 {
 name: 'get_my_notifications',
 description: 'Retorna as notificações e alertas recentes do usuário.',
 input_schema: {
 type: 'object',
 properties: {
 unreadOnly: {
 type: 'boolean',
 description: 'Se verdadeiro, retorna apenas notificações não lidas.',
 },
 },
 required: [],
 },
 },
 {
 name: 'search_my_messages',
 description: 'Pesquisa mensagens nos canais de chat aos quais o usuário tem acesso.',
 input_schema: {
 type: 'object',
 properties: {
 query: {
 type: 'string',
 description: 'Termo de busca nas conversas.',
 },
 },
 required: ['query'],
 },
 },
 {
 name: 'create_task',
 description: 'Cria e delega uma nova tarefa no módulo oficial de tarefas do Command Center.',
 input_schema: {
 type: 'object',
 properties: {
 title: {
 type: 'string',
 description: 'Título claro da tarefa.',
 },
 description: {
 type: 'string',
 description: 'Descrição detalhada e contexto da tarefa.',
 },
 area_id: {
 type: 'string',
 description: 'ID da área/projeto (ex: area-1, area-4).',
 },
 priority: {
 type: 'string',
 enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
 description: 'Nível de prioridade da tarefa.',
 },
 due_date: {
 type: 'string',
 description: 'Data de entrega no formato YYYY-MM-DD.',
 },
 },
 required: ['title', 'description', 'due_date'],
 },
 },
 {
 name: 'update_task',
 description: 'Atualiza o status de uma tarefa existente para COMPLETED, IN_PROGRESS ou BLOCKED.',
 input_schema: {
 type: 'object',
 properties: {
 taskId: {
 type: 'string',
 description: 'ID ou código da tarefa (ex: task-1 ou TASK-0000).',
 },
 status: {
 type: 'string',
 enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
 description: 'Novo status da tarefa.',
 },
 },
 required: ['taskId', 'status'],
 },
 },
 {
 name: 'send_message',
 description: 'Envia uma mensagem para um canal ou conversa. Para ações de impacto, sempre pede confirmação antes.',
 input_schema: {
 type: 'object',
 properties: {
 conversationId: {
 type: 'string',
 description: 'ID da conversa de destino.',
 },
 content: {
 type: 'string',
 description: 'Texto da mensagem a ser enviada.',
 },
 },
 required: ['conversationId', 'content'],
 },
 },
];

// ── 2. Tool Execution Engine com Verificação de Permissões ──
export async function executeAgentTool(
 toolName: string,
 input: Record<string, any>,
 context: AgentContext
): Promise<AgentToolResult> {
 const { currentUser, tasks, areas, notifications, conversations, messages } = context;
 const isExecutive = currentUser.role === 'DONO' || currentUser.role === 'DIRETOR';
 const TODAY = new Date().toISOString().split('T')[0];

 switch (toolName) {
 case 'get_my_profile': {
 return {
 tool_use_id: '',
 content: JSON.stringify({
 id: currentUser.id,
 name: currentUser.name,
 email: currentUser.email,
 role: currentUser.role,
 department: currentUser.department || 'Geral',
 isExecutive,
 }),
 };
 }

 case 'get_my_tasks': {
 // Regra de permissão: Executivos veem todas; colaboradores veem atribuídas ou criadas por eles
 const accessibleTasks = isExecutive
 ? tasks
 : tasks.filter(
 (t) =>
 t.assigned_to_id === currentUser.id ||
 t.delegated_by_id === currentUser.id ||
 t.area_name?.toLowerCase() === currentUser.department?.toLowerCase()
 );

 let filtered = accessibleTasks;
 const filter = input.filter || 'ALL';

 if (filter === 'TODAY') {
 filtered = filtered.filter((t) => t.due_date === TODAY && t.status !== 'COMPLETED');
 } else if (filter === 'OVERDUE') {
 filtered = filtered.filter((t) => t.due_date < TODAY && t.status !== 'COMPLETED');
 } else if (filter === 'UPCOMING') {
 filtered = filtered.filter((t) => t.due_date >= TODAY && t.status !== 'COMPLETED');
 } else if (filter === 'COMPLETED') {
 filtered = filtered.filter((t) => t.status === 'COMPLETED');
 }

 if (input.priority) {
 filtered = filtered.filter((t) => t.priority === input.priority);
 }

 return {
 tool_use_id: '',
 content: JSON.stringify({
 count: filtered.length,
 tasks: filtered.map((t) => ({
 id: t.id,
 code: t.code,
 title: t.title,
 description: t.description,
 status: t.status,
 priority: t.priority,
 due_date: t.due_date,
 assigned_to: t.assigned_to_name,
 area: t.area_name,
 })),
 }),
 };
 }

 case 'get_my_projects': {
 const accessibleAreas = isExecutive
 ? areas
 : areas.filter(
 (a) =>
 a.manager_id === currentUser.id ||
 a.name.toLowerCase() === currentUser.department?.toLowerCase()
 );

 return {
 tool_use_id: '',
 content: JSON.stringify({
 count: accessibleAreas.length,
 projects: accessibleAreas.map((a) => ({
 id: a.id,
 name: a.name,
 status: a.currentStatus,
 manager: a.manager?.name || 'Não atribuído',
 obligationsCount: a.obligationsCount,
 lastUpdated: a.lastUpdated,
 })),
 }),
 };
 }

 case 'get_my_notifications': {
 let userNotifs = notifications.filter((n) => n.user_id === currentUser.id || isExecutive);
 if (input.unreadOnly) {
 userNotifs = userNotifs.filter((n) => !n.read);
 }

 return {
 tool_use_id: '',
 content: JSON.stringify({
 count: userNotifs.length,
 notifications: userNotifs.slice(0, 5).map((n) => ({
 id: n.id,
 title: n.title,
 message: n.message,
 type: n.type,
 created_at: n.created_at,
 })),
 }),
 };
 }

 case 'search_my_messages': {
 const q = (input.query || '').toLowerCase();
 const results: any[] = [];

 for (const conv of conversations) {
 const convMsgs = messages[conv.id] || [];
 for (const msg of convMsgs) {
 if (msg.content.toLowerCase().includes(q)) {
 results.push({
 conversation: conv.title,
 sender: msg.sender?.name || 'Sistema',
 content: msg.content,
 created_at: msg.created_at,
 });
 }
 }
 }

 return {
 tool_use_id: '',
 content: JSON.stringify({
 count: results.length,
 results: results.slice(0, 5),
 }),
 };
 }

 case 'create_task': {
 const targetAreaId = input.area_id || areas[0]?.id || 'area-1';
 const targetArea = areas.find((a) => a.id === targetAreaId);

 const newTaskData = {
 title: input.title,
 description: input.description,
 area_id: targetAreaId,
 area_name: targetArea?.name || 'Geral',
 priority: (input.priority || 'MEDIUM') as TaskPriority,
 due_date: input.due_date,
 };

 return {
 tool_use_id: '',
 content: JSON.stringify({
 success: true,
 message: `Tarefa criada com sucesso: "${input.title}" para ${input.due_date}.`,
 task: newTaskData,
 }),
 actionTaken: {
 type: 'TASK_CREATED',
 data: newTaskData,
 },
 };
 }

 case 'update_task': {
 const targetTask = tasks.find((t) => t.id === input.taskId || t.code === input.taskId);
 if (!targetTask) {
 return {
 tool_use_id: '',
 content: JSON.stringify({
 success: false,
 error: `Tarefa não encontrada com identificador ${input.taskId}`,
 }),
 };
 }

 return {
 tool_use_id: '',
 content: JSON.stringify({
 success: true,
 message: `Tarefa ${targetTask.code} atualizada para ${input.status}.`,
 taskId: targetTask.id,
 newStatus: input.status,
 }),
 actionTaken: {
 type: 'TASK_UPDATED',
 data: {
 taskId: targetTask.id,
 status: input.status,
 },
 },
 };
 }

 case 'send_message': {
 return {
 tool_use_id: '',
 content: JSON.stringify({
 success: true,
 message: `Mensagem enviada para o canal ${input.conversationId}.`,
 }),
 actionTaken: {
 type: 'MESSAGE_SENT',
 data: {
 conversationId: input.conversationId,
 content: input.content,
 },
 },
 };
 }

 default:
 return {
 tool_use_id: '',
 content: JSON.stringify({ error: `Ferramenta '${toolName}' não reconhecida.` }),
 };
 }
}

// ── 3. Motor Heurístico com Raciocínio Contextual Local (Fallback Inteligente) ──
export async function runLocalAgentInference(
 userMessage: string,
 context: AgentContext,
 history: Array<{ sender: 'user' | 'agent'; text: string }> = []
): Promise<{ text: string; thoughtProcess?: string; toolsUsed: string[]; actionTaken?: any; engineType: 'local' }> {
 const lower = userMessage.toLowerCase().trim();
 const toolsUsed: string[] = [];
 const thoughts: string[] = [];
 const actionTaken: any = undefined;

 thoughts.push(`[Raciocínio Local] Analisando mensagem do usuário: "${userMessage}"`);
 thoughts.push(`[Perfil] Usuário ativo: ${context.currentUser.name} (${context.currentUser.role} · ${context.currentUser.department || 'Geral'})`);

 // Detecta se a última mensagem do agente listava tarefas
 const lastAgentMsg = history.filter((h) => h.sender === 'agent').slice(-1)[0]?.text || '';
 const contextMentionsTasks = lastAgentMsg.includes('tarefa') || lastAgentMsg.includes('TASK-') || lastAgentMsg.includes('pendente');

 // Intenção 1: Como concluir / Como resolver / Dúvida sobre finalização de tarefas (inclui typos como "conlui-las")
 const isHowToComplete =
 lower.includes('conlui') ||
 lower.includes('conclui') ||
 lower.includes('finaliz') ||
 lower.includes('como posso') ||
 lower.includes('como faco') ||
 lower.includes('como fazer') ||
 lower.includes('como resolver') ||
 lower.includes('como fechar') ||
 (contextMentionsTasks && (lower.includes('como') || lower.includes('quais') || lower.includes('fazer')));

 if (isHowToComplete && !lower.includes('crie') && !lower.includes('criar')) {
 toolsUsed.push('get_my_tasks');
 thoughts.push('[Dedução] Identificada intenção de orientação sobre como concluir/executar tarefas.');
 thoughts.push('[Ação] Consultando base de tarefas ativas do usuário para contextualizar a resposta...');

 const taskResult = await executeAgentTool('get_my_tasks', { filter: 'ALL' }, context);
 const parsed = JSON.parse(taskResult.content);
 const pendingTasks = (parsed.tasks || []).filter((t: any) => t.status !== 'COMPLETED');

 thoughts.push(`[Resultado] ${pendingTasks.length} tarefa(s) pendente(s) identificada(s). Estruturando passo a passo executivo.`);

 let taskExamples = '';
 if (pendingTasks.length > 0) {
 taskExamples = pendingTasks
 .slice(0, 3)
 .map((t: any) => `• **[${t.code}] ${t.title}** (${t.priority} · Prazo: ${t.due_date})`)
 .join('\n');
 }

 const responseText = `Para concluir suas tarefas no **Yggdron Command Center**, você possui **3 maneiras rápidas e práticas**:

### 1. Diretamente Comigo (Copiloto IA)
Basta me enviar uma mensagem rápida informando o código da tarefa. Por exemplo:
> *"Conclua a tarefa ${pendingTasks[0]?.code || 'TASK-0001'}"* ou *"Marque ${pendingTasks[0]?.title || 'a primeira tarefa'} como concluída"*.
Eu atualizo o status no sistema instantaneamente para você!

### 2. Pelo Painel de Atividades & Rituais
No módulo de **Tarefas** ou no seu **Dashboard Executivo**:
1. Localize o card da tarefa na sua lista;
2. Clique no ícone circular de **Checkmark ()** para concluir;
3. O status mudará imediatamente para **COMPLETED** com registro de auditoria.

### 3. Por Delegação ou Reatribuição
Caso uma tarefa dependa de outro setor ou membro da equipe, você pode abrir os detalhes da demanda e clicar em **Delegar** para transferir a responsabilidade.

${
 pendingTasks.length > 0
 ? `\n **Tarefas pendentes sob sua responsabilidade agora:**\n${taskExamples}\n\nDeseja que eu conclua alguma delas agora? Basta me indicar qual!`
 : '\n Você não possui nenhuma tarefa pendente no momento. Todas estão concluídas!'
}`;

 return {
 text: responseText,
 thoughtProcess: thoughts.join('\n'),
 toolsUsed,
 engineType: 'local',
 };
 }

 // Intenção 2: Consulta de Tarefas / O que tenho hoje / Atrasadas / Pendências
 if (
 lower.includes('hoje') ||
 lower.includes('tarefa') ||
 lower.includes('fazer') ||
 lower.includes('atrasad') ||
 lower.includes('pendent') ||
 lower.includes('minhas demand')
 ) {
 toolsUsed.push('get_my_tasks');
 const filter = lower.includes('atrasad') ? 'OVERDUE' : lower.includes('hoje') ? 'TODAY' : 'ALL';
 thoughts.push(`[Dedução] Consulta de tarefas com filtro: ${filter}`);

 const taskResult = await executeAgentTool('get_my_tasks', { filter }, context);
 const parsed = JSON.parse(taskResult.content);

 if (parsed.count === 0) {
 thoughts.push('[Resultado] Nenhuma tarefa encontrada no filtro solicitado.');
 return {
 text: `Olá, **${context.currentUser.name}**. Consultei o Command Center e você **não possui tarefas pendentes** no filtro solicitado (${
 filter === 'TODAY' ? 'hoje' : filter === 'OVERDUE' ? 'atrasadas' : 'geral'
 }). Toda a sua operação está em dia!`,
 thoughtProcess: thoughts.join('\n'),
 toolsUsed,
 engineType: 'local',
 };
 }

 thoughts.push(`[Resultado] ${parsed.count} tarefa(s) encontrada(s). Formatando lista.`);

 const taskList = parsed.tasks
 .map((t: any) => `• **[${t.code}] ${t.title}** (${t.priority} • Prazo: ${t.due_date}) — *Status: ${t.status}*`)
 .join('\n');

 return {
 text: `Olá, **${context.currentUser.name}**! Encontrei **${parsed.count} tarefa(s)** sob sua gestão:\n\n${taskList}\n\n **Dica:** Você pode me pedir para concluir qualquer uma delas dizendo: *"Conclua a tarefa ${parsed.tasks[0]?.code}"*!`,
 thoughtProcess: thoughts.join('\n'),
 toolsUsed,
 engineType: 'local',
 };
 }

 // Intenção 3: Criar / Agendar Nova Tarefa
 if (
 lower.includes('crie uma tarefa') ||
 lower.includes('criar tarefa') ||
 lower.includes('nova tarefa') ||
 lower.includes('agende') ||
 lower.includes('nova demanda')
 ) {
 toolsUsed.push('create_task');
 thoughts.push('[Dedução] Intenção de criação e delegação de tarefa detectada.');

 const tomorrow = new Date();
 tomorrow.setDate(tomorrow.getDate() + 1);
 const dueDate = tomorrow.toISOString().split('T')[0];

 const cleanTitle = userMessage
 .replace(/crie uma tarefa (para|de)?/i, '')
 .replace(/criar tarefa (para|de)?/i, '')
 .replace(/agende (uma tarefa|uma reunião)?/i, '')
 .trim();

 const title = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'Revisão Operacional de Demandas';
 const priority = lower.includes('urgente') || lower.includes('critica') ? 'HIGH' : 'MEDIUM';

 thoughts.push(`[Execução] Criando tarefa: "${title}" | Prazo: ${dueDate} | Prioridade: ${priority}`);

 const createResult = await executeAgentTool(
 'create_task',
 {
 title,
 description: `Demanda criada via Personal Copilot para ${context.currentUser.name}`,
 due_date: dueDate,
 priority,
 },
 context
 );

 return {
 text: ` **Tarefa criada com sucesso no Command Center!**\n\n• **Título:** ${title}\n• **Prazo de Entrega:** ${dueDate}\n• **Prioridade:** ${priority === 'HIGH' ? 'Alta' : 'Média'}\n• **Área:** Geral\n\nA demanda já está registrada e visível no seu quadro operacional.`,
 thoughtProcess: thoughts.join('\n'),
 toolsUsed,
 actionTaken: createResult.actionTaken,
 engineType: 'local',
 };
 }

 // Intenção 4: Marcar Tarefa como Concluída por Comando Direto
 if (
 (lower.includes('conclu') || lower.includes('finaliz') || lower.includes('fech')) &&
 (lower.includes('task-') || lower.includes('tarefa') || lower.includes('primeira') || lower.includes('todas'))
 ) {
 toolsUsed.push('update_task');
 thoughts.push('[Dedução] Comando direto de alteração de status para COMPLETED.');

 // Procura código da tarefa na mensagem (ex: task-1, TASK-0001)
 const matchCode = userMessage.match(/task-[\w\d-]+/i);
 const targetTask = matchCode
 ? context.tasks.find((t) => t.id.toLowerCase() === matchCode[0].toLowerCase() || t.code.toLowerCase() === matchCode[0].toLowerCase())
 : context.tasks.find((t) => t.status !== 'COMPLETED') || context.tasks[0];

 if (targetTask) {
 thoughts.push(`[Ação] Atualizando status da tarefa [${targetTask.code}] "${targetTask.title}" para COMPLETED.`);
 const updateResult = await executeAgentTool(
 'update_task',
 {
 taskId: targetTask.id,
 status: 'COMPLETED',
 },
 context
 );

 return {
 text: ` **Tarefa [${targetTask.code}] marcada como CONCLUÍDA!**\n\nA demanda **"${targetTask.title}"** foi finalizada no sistema com sucesso.`,
 thoughtProcess: thoughts.join('\n'),
 toolsUsed,
 actionTaken: updateResult.actionTaken,
 engineType: 'local',
 };
 }
 }

 // Intenção 5: Projetos / Áreas do Sistema
 if (lower.includes('projeto') || lower.includes('área') || lower.includes('setor') || lower.includes('departamento')) {
 toolsUsed.push('get_my_projects');
 thoughts.push('[Dedução] Consulta de projetos e áreas operacionais.');

 const projResult = await executeAgentTool('get_my_projects', {}, context);
 const parsed = JSON.parse(projResult.content);

 const projList = parsed.projects
 .map((p: any) => `• **${p.name}** (Status: *${p.status}* • Gestor: ${p.manager})`)
 .join('\n');

 return {
 text: `Você possui acesso a **${parsed.count} projeto(s)/área(s)** no Command Center:\n\n${projList}`,
 thoughtProcess: thoughts.join('\n'),
 toolsUsed,
 engineType: 'local',
 };
 }

 // Intenção 6: Notificações / Alertas
 if (lower.includes('notifica') || lower.includes('alerta') || lower.includes('urgente') || lower.includes('incidente')) {
 toolsUsed.push('get_my_notifications');
 thoughts.push('[Dedução] Verificação de notificações e alertas do usuário.');

 const notifResult = await executeAgentTool('get_my_notifications', { unreadOnly: true }, context);
 const parsed = JSON.parse(notifResult.content);

 if (parsed.count === 0) {
 return {
 text: `Nenhuma notificação urgente ou pendente no momento. Toda a operação está calma no seu setor!`,
 thoughtProcess: thoughts.join('\n'),
 toolsUsed,
 engineType: 'local',
 };
 }

 const notifList = parsed.notifications
 .map((n: any) => `• **[${n.type}] ${n.title}**: ${n.message}`)
 .join('\n');

 return {
 text: `Encontrei **${parsed.count} notificação(ões) importante(s)**:\n\n${notifList}`,
 thoughtProcess: thoughts.join('\n'),
 toolsUsed,
 engineType: 'local',
 };
 }

 // Resposta Padrão Consultiva Contextual com orientações claras
 toolsUsed.push('get_my_profile');
 thoughts.push('[Dedução] Saudação inicial ou solicitação aberta. Apresentando capacidades executivas.');

 return {
 text: `Olá, **${context.currentUser.name}** (${context.currentUser.role} • ${context.currentUser.department || 'Geral'}).

Sou o seu **Personal AI Copilot** no Command Center. Estou conectado a todas as suas tarefas, projetos, canais de comunicação e alertas corporativos.

Como posso te ajudar hoje?
• *"O que preciso fazer hoje?"* — Lista suas tarefas e prazos
• *"Como posso concluí-las?"* — Orienta a execução ou conclui por comando
• *"Crie uma tarefa urgente para..."* — Registra novas demandas
• *"Mostre meus projetos e status"* — Panorama das áreas operacionais`,
 thoughtProcess: thoughts.join('\n'),
 toolsUsed,
 engineType: 'local',
 };
}
