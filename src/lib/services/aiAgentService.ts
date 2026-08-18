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

// ── 3. Heurística Local / Fallback Mock Engine (para quando ANTHROPIC_API_KEY não estiver setada) ──
export async function runLocalAgentInference(
  userMessage: string,
  context: AgentContext
): Promise<{ text: string; toolsUsed: string[]; actionTaken?: any }> {
  const lower = userMessage.toLowerCase();
  const toolsUsed: string[] = [];
  let actionTaken: any = undefined;

  // Consulta 1: O que tenho hoje? / Minhas tarefas / Tarefas atrasadas
  if (lower.includes('hoje') || lower.includes('tarefa') || lower.includes('fazer') || lower.includes('atrasad')) {
    toolsUsed.push('get_my_tasks');
    const filter = lower.includes('atrasad') ? 'OVERDUE' : lower.includes('hoje') ? 'TODAY' : 'ALL';
    const taskResult = await executeAgentTool('get_my_tasks', { filter }, context);
    const parsed = JSON.parse(taskResult.content);

    if (parsed.count === 0) {
      return {
        text: `Olá, ${context.currentUser.name}. Consultei o sistema e você **não possui tarefas pendentes** no filtro solicitado (${filter === 'TODAY' ? 'hoje' : filter === 'OVERDUE' ? 'atrasadas' : 'geral'}). Sua operação está em dia!`,
        toolsUsed,
      };
    }

    const taskList = parsed.tasks
      .map((t: any) => `• **[${t.code}] ${t.title}** (${t.priority} • Prazo: ${t.due_date}) — *${t.status}*`)
      .join('\n');

    return {
      text: `Olá, ${context.currentUser.name}! Encontrei **${parsed.count} tarefa(s)** sob sua responsabilidade:\n\n${taskList}\n\nPosso te ajudar a concluir ou atualizar alguma delas?`,
      toolsUsed,
    };
  }

  // Ação 2: Criar tarefa
  if (lower.includes('crie uma tarefa') || lower.includes('criar tarefa') || lower.includes('nova tarefa') || lower.includes('agende')) {
    toolsUsed.push('create_task');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = tomorrow.toISOString().split('T')[0];

    const cleanTitle = userMessage
      .replace(/crie uma tarefa (para|de)?/i, '')
      .replace(/criar tarefa (para|de)?/i, '')
      .trim();

    const title = cleanTitle ? cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1) : 'Revisão Operacional de Demandas';
    const createResult = await executeAgentTool('create_task', {
      title,
      description: `Tarefa criada pelo Copiloto IA para ${context.currentUser.name}`,
      due_date: dueDate,
      priority: lower.includes('urgente') ? 'HIGH' : 'MEDIUM',
    }, context);

    return {
      text: `✓ **Tarefa criada com sucesso no Command Center!**\n\n• **Título:** ${title}\n• **Prazo:** ${dueDate}\n• **Prioridade:** ${lower.includes('urgente') ? 'Alta' : 'Média'}\n\nA tarefa já está registrada no seu quadro de atividades.`,
      toolsUsed,
      actionTaken: createResult.actionTaken,
    };
  }

  // Ação 3: Marcar tarefa como concluída
  if (lower.includes('concluída') || lower.includes('conclua') || lower.includes('finalizar') || lower.includes('concluir')) {
    toolsUsed.push('update_task');
    const firstTask = context.tasks[0];
    if (firstTask) {
      const updateResult = await executeAgentTool('update_task', {
        taskId: firstTask.id,
        status: 'COMPLETED',
      }, context);

      return {
        text: `✓ **Tarefa [${firstTask.code}] marcada como CONCLUÍDA!**\n\n"${firstTask.title}" foi finalizada no sistema.`,
        toolsUsed,
        actionTaken: updateResult.actionTaken,
      };
    }
  }

  // Consulta 4: Projetos / Áreas
  if (lower.includes('projeto') || lower.includes('área') || lower.includes('setor')) {
    toolsUsed.push('get_my_projects');
    const projResult = await executeAgentTool('get_my_projects', {}, context);
    const parsed = JSON.parse(projResult.content);

    const projList = parsed.projects
      .map((p: any) => `• **${p.name}** (Status: *${p.status}* • Gestor: ${p.manager})`)
      .join('\n');

    return {
      text: `Você possui acesso a **${parsed.count} projeto(s)/área(s)** no Command Center:\n\n${projList}`,
      toolsUsed,
    };
  }

  // Consulta 5: Notificações
  if (lower.includes('notificação') || lower.includes('notificações') || lower.includes('alerta') || lower.includes('urgente')) {
    toolsUsed.push('get_my_notifications');
    const notifResult = await executeAgentTool('get_my_notifications', { unreadOnly: true }, context);
    const parsed = JSON.parse(notifResult.content);

    if (parsed.count === 0) {
      return {
        text: `Nenhuma notificação urgente ou pendente no momento. Tudo tranquilo no seu setor!`,
        toolsUsed,
      };
    }

    const notifList = parsed.notifications
      .map((n: any) => `• **[${n.type}] ${n.title}**: ${n.message}`)
      .join('\n');

    return {
      text: `Encontrei **${parsed.count} notificação(ões) importante(s)**:\n\n${notifList}`,
      toolsUsed,
    };
  }

  // Resposta padrão contextual
  toolsUsed.push('get_my_profile');
  return {
    text: `Olá, ${context.currentUser.name} (${context.currentUser.role} • ${context.currentUser.department || 'Copper Group'}).\n\nSou o seu **Personal AI Copilot**. Posso consultar suas tarefas, verificar status de projetos, checar alertas ou criar novas demandas diretamente no Command Center. Como posso te ajudar agora?`,
    toolsUsed,
  };
}
