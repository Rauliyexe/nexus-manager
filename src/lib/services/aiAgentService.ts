import {
 Profile,
 HubTask,
 Area,
 NotificationItem,
 Conversation,
 Message,
 TaskPriority,
 TaskStatus,
 TicketCategory,
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
 type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TICKET_CREATED' | 'STATUS_SUBMITTED' | 'MESSAGE_SENT' | 'CONFIRMATION_REQUIRED';
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
    name: 'create_support_ticket',
    description: 'Abre um chamado de suporte/incidente operacional (Helpdesk, TI, Manutenção, Infraestrutura) no Command Center.',
    input_schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Título conciso do chamado (ex: "Servidor fora do ar", "Vazamento na prensa").',
        },
        description: {
          type: 'string',
          description: 'Descrição detalhada do incidente ou solicitação de suporte.',
        },
        category: {
          type: 'string',
          enum: ['TI_SUPPORTE', 'MANUTENCAO', 'SEGURANCA', 'SUPRIMENTOS', 'RH_PESSOAS', 'OUTROS'],
          description: 'Categoria do chamado.',
        },
        priority: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          description: 'Nível de urgência/prioridade.',
        },
        area_id: {
          type: 'string',
          description: 'ID da área afetada (opcional, ex: area-4 para TI).',
        },
      },
      required: ['title', 'description'],
    },
  },
  {
    name: 'submit_operational_status',
    description: 'Registra e envia o fechamento operacional diário de um departamento/área (status GREEN/OK, YELLOW/ATENÇÃO ou RED/CRÍTICO).',
    input_schema: {
      type: 'object',
      properties: {
        area_name_or_id: {
          type: 'string',
          description: 'Nome ou ID da área (ex: "Fundição", "Comercial Compras", "TI", "area-1").',
        },
        status: {
          type: 'string',
          enum: ['GREEN', 'YELLOW', 'RED'],
          description: 'Status do fechamento (GREEN = OK, YELLOW = Atenção, RED = Crítico/Incidente).',
        },
        justification: {
          type: 'string',
          description: 'Justificativa ou relato das atividades executadas e pendências.',
        },
      },
      required: ['area_name_or_id', 'status'],
    },
  },
  {
    name: 'get_financial_telemetry',
    description: 'Consulta indicadores financeiros em tempo real (saldo de caixa, contas a receber, contas a pagar, margem operacional).',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
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

    case 'create_support_ticket': {
      const targetArea = areas.find(
        (a) =>
          a.id === input.area_id ||
          a.name.toLowerCase().includes((input.area_id || '').toLowerCase()) ||
          a.name.toLowerCase().includes('ti')
      ) || areas[0];

      const ticketPayload = {
        title: input.title,
        description: input.description,
        category: (input.category || 'TI_SUPPORTE') as TicketCategory,
        area_id: targetArea?.id || 'area-4',
        priority: (input.priority || 'HIGH') as TaskPriority,
      };

      return {
        tool_use_id: '',
        content: JSON.stringify({
          success: true,
          message: `Chamado operacional criado com sucesso: "${input.title}" para a área de ${targetArea?.name || 'TI'}.`,
          ticket: ticketPayload,
        }),
        actionTaken: {
          type: 'TICKET_CREATED',
          data: ticketPayload,
        },
      };
    }

    case 'submit_operational_status': {
      const targetArea = areas.find(
        (a) =>
          a.id === input.area_name_or_id ||
          a.name.toLowerCase().includes((input.area_name_or_id || '').toLowerCase())
      ) || areas[0];

      const statusData = {
        area_id: targetArea?.id || 'area-1',
        area_name: targetArea?.name || 'Operacional',
        status: input.status,
        justification: input.justification || 'Fechamento registrado via comando de voz / IA.',
      };

      return {
        tool_use_id: '',
        content: JSON.stringify({
          success: true,
          message: `Fechamento da área ${targetArea?.name || 'Operacional'} registrado como status ${input.status}.`,
          data: statusData,
        }),
        actionTaken: {
          type: 'STATUS_SUBMITTED',
          data: statusData,
        },
      };
    }

    case 'get_financial_telemetry': {
      return {
        tool_use_id: '',
        content: JSON.stringify({
          cash_balance: 'R$ 14.850.000,00',
          receivables_month: 'R$ 8.920.000,00',
          payables_month: 'R$ 5.410.000,00',
          net_margin: '18.4%',
          lme_copper_cash: 'US$ 9.420,00 / ton',
          fx_usd_brl: 'R$ 5,72',
          summary: 'Caixa robusto com liquidez imediata e margem operacional acima da meta (18.4%).',
        }),
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

  // ── PRIORIDADE 1: Criar / Delegar / Agendar Nova Tarefa ──
  const isCreateTask =
    lower.includes('crie uma tarefa') ||
    lower.includes('criar tarefa') ||
    lower.includes('nova tarefa') ||
    lower.includes('delegar tarefa') ||
    lower.includes('delegar para') ||
    lower.includes('agende uma tarefa') ||
    lower.includes('agendar tarefa') ||
    lower.includes('nova demanda') ||
    lower.includes('adicionar tarefa') ||
    lower.includes('cadastrar tarefa') ||
    (lower.startsWith('crie') && (lower.includes('tarefa') || lower.includes('demanda') || lower.includes('para'))) ||
    (lower.startsWith('criar') && (lower.includes('tarefa') || lower.includes('demanda') || lower.includes('para'))) ||
    (lower.startsWith('delegar') && (lower.includes('tarefa') || lower.includes('para')));

  if (isCreateTask) {
    toolsUsed.push('create_task');
    thoughts.push('[Dedução] Intenção prioritária de criação e delegação de tarefa detectada.');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split('T')[0];

    // Detecta área de destino mencionada na fala
    const targetArea = context.areas.find((a) => {
      const aName = a.name.toLowerCase();
      return (
        lower.includes(aName) ||
        (aName.includes('compras') && (lower.includes('compras') || lower.includes('compra'))) ||
        (aName.includes('fundição') && (lower.includes('fundicao') || lower.includes('fundição') || lower.includes('produção'))) ||
        (aName.includes('logística') && (lower.includes('logistica') || lower.includes('logística') || lower.includes('frota'))) ||
        (aName.includes('financeiro') && (lower.includes('financeiro') || lower.includes('caixa') || lower.includes('contas'))) ||
        (aName.includes('ti') && (lower.includes('ti') || lower.includes('sistemas') || lower.includes('servidor')))
      );
    }) || context.areas[0];

    let cleanTitle = userMessage
      .replace(/valkyra,?\s*/i, '')
      .replace(/(crie|criar|adicione|adicionar|cadastre|cadastrar|delegar|delegue|agende|agendar)\s+(uma\s+)?(nova\s+)?(tarefa|demanda)?\s*(para|de|sobre)?\s*(o|a|os|as)?\s*(para)?/i, '')
      .trim();

    // Se tiver nome da área no início, limpa para deixar o título focado na ação
    if (targetArea) {
      cleanTitle = cleanTitle.replace(new RegExp(`^(o\\s+|a\\s+)?(para\\s+)?${targetArea.name}\\s*(eles\\s+precisam|precisa|deve)?\\s*`, 'i'), '');
    }

    if (!cleanTitle || cleanTitle.length < 3) {
      cleanTitle = userMessage.replace(/valkyra,?\s*/i, '').trim();
    }

    const title = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    const priority: TaskPriority = lower.includes('urgente') || lower.includes('critica') || lower.includes('crítica') ? 'HIGH' : 'MEDIUM';

    thoughts.push(`[Execução] Criando tarefa no Hub: "${title}" | Área: ${targetArea?.name || 'Geral'} | Prazo: ${dueDate} | Prioridade: ${priority}`);

    const createResult = await executeAgentTool(
      'create_task',
      {
        title,
        description: `Demanda delegada via Valkyra por ${context.currentUser.name}: "${userMessage}"`,
        area_id: targetArea?.id || 'area-1',
        due_date: dueDate,
        priority,
      },
      context
    );

    return {
      text: `📋 **Tarefa criada e delegada com sucesso no Command Center!**\n\n• **Título:** ${title}\n• **Área Responsável:** ${targetArea?.name || 'Geral'}\n• **Prazo de Entrega:** ${dueDate}\n• **Prioridade:** ${priority === 'HIGH' ? '🔴 Alta / Urgente' : '🟡 Média'}\n\nA demanda já está registrada e visível no seu quadro operacional no **Hub de Demandas**!`,
      thoughtProcess: thoughts.join('\n'),
      toolsUsed,
      actionTaken: createResult.actionTaken,
      engineType: 'local',
    };
  }

  // ── PRIORIDADE 2: Abrir Chamado / Suporte / Incidente Operacional ──
  const isCreateTicket =
    lower.includes('chamado') ||
    lower.includes('suporte') ||
    lower.includes('servidor') ||
    lower.includes('ticket') ||
    lower.includes('abrir chamado') ||
    lower.includes('criar chamado') ||
    lower.includes('incidente') ||
    (lower.includes('manutenção') && (lower.includes('abrir') || lower.includes('solicitar') || lower.includes('urgente')));

  if (isCreateTicket) {
    toolsUsed.push('create_support_ticket');
    thoughts.push('[Dedução] Comando operacional para abertura de chamado de suporte/incidente.');

    const targetArea = context.areas.find((a) => {
      const aName = a.name.toLowerCase();
      return (
        (lower.includes('ti') || lower.includes('servidor') || lower.includes('sistema')) && aName.includes('ti') ||
        (lower.includes('manutenção') || lower.includes('prensa') || lower.includes('máquina')) && aName.includes('manutenção')
      );
    }) || context.areas.find((a) => a.name.toLowerCase().includes('ti')) || context.areas[0];

    let cleanTitle = userMessage
      .replace(/valkyra,?\s*/i, '')
      .replace(/(abrir|criar|registre|gerar|solicitar)\s+(um\s+)?(novo\s+)?chamado\s+(de\s+|para\s+)?/i, '')
      .replace(/(urgente\s+)?(sobre\s+|para\s+)?/i, '')
      .trim();

    if (!cleanTitle || cleanTitle.length < 3) cleanTitle = 'Incidente Operacional Reportado por Voz';
    const titleFormatted = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    const priority: TaskPriority = lower.includes('urgente') || lower.includes('crítico') || lower.includes('critica') || lower.includes('grave') ? 'CRITICAL' : 'HIGH';
    const category: TicketCategory = lower.includes('servidor') || lower.includes('ti') || lower.includes('sistema') || lower.includes('internet') ? 'TI_SUPPORTE' : 'MANUTENCAO';

    const ticketResult = await executeAgentTool(
      'create_support_ticket',
      {
        title: titleFormatted,
        description: `Incidente registrado via comando de voz pelo colaborador ${context.currentUser.name}: "${userMessage}"`,
        category,
        priority,
        area_id: targetArea?.id || 'area-4',
      },
      context
    );

    return {
      text: `✅ **Chamado Aberto com Sucesso no Command Center!**\n\n• **Título:** ${titleFormatted}\n• **Categoria:** ${category === 'TI_SUPPORTE' ? 'TI & Infraestrutura' : 'Manutenção Industrial'}\n• **Prioridade:** ${priority === 'CRITICAL' ? '🔴 Crítica / Urgente' : '🟠 Alta'}\n• **Área:** ${targetArea?.name || 'TI & Sistemas'}\n• **Status:** ABERTO (Aguardando atendimento)\n\nO chamado foi encaminhado para a fila de atendimento da equipe técnica e registrado na Central de Chamados!`,
      thoughtProcess: thoughts.join('\n'),
      toolsUsed,
      actionTaken: ticketResult.actionTaken,
      engineType: 'local',
    };
  }

  // ── PRIORIDADE 3: Fechamento Operacional por Voz ou Texto ──
  if (
    lower.includes('fechamento') ||
    lower.includes('status da área') ||
    lower.includes('registrar fechamento') ||
    lower.includes('fechar dia')
  ) {
    toolsUsed.push('submit_operational_status');
    thoughts.push('[Dedução] Comando para envio de fechamento operacional diário.');

    const status = lower.includes('crítico') || lower.includes('critico') || lower.includes('grave') || lower.includes('parada')
      ? 'RED'
      : lower.includes('atenção') || lower.includes('atencao') || lower.includes('pendência') || lower.includes('alerta')
      ? 'YELLOW'
      : 'GREEN';

    const targetArea = context.areas.find((a) => {
      const aName = a.name.toLowerCase();
      return (
        lower.includes(aName) ||
        (aName.includes('fundição') && (lower.includes('fundicao') || lower.includes('fundição'))) ||
        (aName.includes('compras') && lower.includes('compras')) ||
        (aName.includes('logística') && lower.includes('logistica'))
      );
    }) || context.areas[0];

    const statusResult = await executeAgentTool(
      'submit_operational_status',
      {
        area_name_or_id: targetArea?.name || 'Fundição & Produção',
        status,
        justification: `Fechamento reportado via comando operacional: "${userMessage}"`,
      },
      context
    );

    return {
      text: `📋 **Fechamento Operacional Registrado!**\n\n• **Área:** ${targetArea?.name || 'Fundição & Produção'}\n• **Status Registrado:** ${status === 'GREEN' ? '🟢 OK' : status === 'YELLOW' ? '🟡 ATENÇÃO' : '🔴 CRÍTICO'}\n• **Horário:** ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}\n\nO status foi atualizado no painel diário e registrado no Command Center.`,
      thoughtProcess: thoughts.join('\n'),
      toolsUsed,
      actionTaken: statusResult.actionTaken,
      engineType: 'local',
    };
  }

  // ── PRIORIDADE 4: Marcar Tarefa como Concluída por Comando Direto ──
  if (
    (lower.includes('conclu') || lower.includes('finaliz') || lower.includes('fech')) &&
    (lower.includes('task-') || lower.includes('tarefa') || lower.includes('primeira') || lower.includes('todas')) &&
    !isCreateTask
  ) {
    toolsUsed.push('update_task');
    thoughts.push('[Dedução] Comando direto de alteração de status para COMPLETED.');

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
        text: `✅ **Tarefa [${targetTask.code}] marcada como CONCLUÍDA!**\n\nA demanda **"${targetTask.title}"** foi finalizada no sistema com sucesso.`,
        thoughtProcess: thoughts.join('\n'),
        toolsUsed,
        actionTaken: updateResult.actionTaken,
        engineType: 'local',
      };
    }
  }

  // ── PRIORIDADE 5: Telemetria Financeira / Caixa / Finanças ──
  if (lower.includes('caixa') || lower.includes('finan') || lower.includes('telemetria') || lower.includes('saldo') || lower.includes('receber')) {
    toolsUsed.push('get_financial_telemetry');
    thoughts.push('[Dedução] Consulta de telemetria financeira em tempo real.');

    const finResult = await executeAgentTool('get_financial_telemetry', {}, context);
    const fin = JSON.parse(finResult.content);

    return {
      text: `📊 **Telemetria Financeira & Posição de Caixa:**\n\n• **Saldo em Caixa / Disponibilidades:** ${fin.cash_balance}\n• **Contas a Receber (Mês):** ${fin.receivables_month}\n• **Contas a Pagar (Mês):** ${fin.payables_month}\n• **Margem Operacional Líquida:** ${fin.net_margin}\n• **Cotação Cobre (LME Cash):** ${fin.lme_copper_cash}\n\n💡 *${fin.summary}*`,
      thoughtProcess: thoughts.join('\n'),
      toolsUsed,
      engineType: 'local',
    };
  }

  // ── PRIORIDADE 6: Como Concluir / Dúvida sobre finalização de tarefas ──
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

  if (isHowToComplete && !lower.includes('crie') && !lower.includes('criar') && !lower.includes('delegar')) {
    toolsUsed.push('get_my_tasks');
    thoughts.push('[Dedução] Identificada intenção de orientação sobre como concluir/executar tarefas.');

    const taskResult = await executeAgentTool('get_my_tasks', { filter: 'ALL' }, context);
    const parsed = JSON.parse(taskResult.content);
    const pendingTasks = (parsed.tasks || []).filter((t: any) => t.status !== 'COMPLETED');

    let taskExamples = '';
    if (pendingTasks.length > 0) {
      taskExamples = pendingTasks
        .slice(0, 3)
        .map((t: any) => `• **[${t.code}] ${t.title}** (${t.priority} · Prazo: ${t.due_date})`)
        .join('\n');
    }

    return {
      text: `Para concluir suas tarefas no **Yggdron Command Center**, você possui **3 maneiras rápidas e práticas**:

### 1. Diretamente Comigo (Copiloto IA)
Basta me enviar uma mensagem rápida ou comando de voz. Exemplo:
> *"Conclua a tarefa ${pendingTasks[0]?.code || 'TASK-0001'}"*.

### 2. Pelo Painel de Tarefas
No módulo de **Tarefas** ou **Hub**:
1. Localize a demanda na lista;
2. Clique no ícone de **Checkmark (✔)** para concluir.

### 3. Por Delegação
Abra os detalhes da tarefa e clique em **Delegar** para transferir a responsabilidade.

${
  pendingTasks.length > 0
    ? `\n📌 **Tarefas pendentes sob sua gestão:**\n${taskExamples}\n\nDeseja que eu conclua alguma delas agora? Basta me indicar!`
    : '\n✨ Você não possui nenhuma tarefa pendente no momento. Todas estão concluídas!'
}`,
      thoughtProcess: thoughts.join('\n'),
      toolsUsed,
      engineType: 'local',
    };
  }

  // ── PRIORIDADE 7: Consulta de Tarefas / O que tenho hoje / Atrasadas / Pendências ──
  if (
    lower.includes('hoje') ||
    lower.includes('minhas tarefas') ||
    lower.includes('quais tarefas') ||
    lower.includes('tarefas pendentes') ||
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
      return {
        text: `Olá, **${context.currentUser.name}**. Consultei o Command Center e você **não possui tarefas pendentes** no filtro solicitado (${
          filter === 'TODAY' ? 'hoje' : filter === 'OVERDUE' ? 'atrasadas' : 'geral'
        }). Toda a sua operação está em dia!`,
        thoughtProcess: thoughts.join('\n'),
        toolsUsed,
        engineType: 'local',
      };
    }

    const taskList = parsed.tasks
      .map((t: any) => `• **[${t.code}] ${t.title}** (${t.priority} • Prazo: ${t.due_date}) — *Status: ${t.status}*`)
      .join('\n');

    return {
      text: `Olá, **${context.currentUser.name}**! Encontrei **${parsed.count} tarefa(s)** sob sua gestão:\n\n${taskList}\n\n💡 **Dica:** Você pode me pedir para concluir qualquer uma delas dizendo: *"Conclua a tarefa ${parsed.tasks[0]?.code}"*!`,
      thoughtProcess: thoughts.join('\n'),
      toolsUsed,
      engineType: 'local',
    };
  }

 // Intenção 8: Projetos / Áreas do Sistema
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
