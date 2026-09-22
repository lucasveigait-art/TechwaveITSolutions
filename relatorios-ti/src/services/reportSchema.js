// Estrutura de dados do relatorio mensal de TI, baseada nas melhores praticas
// de mercado para MSPs: resumo executivo com status RAG, performance de
// service desk, cumprimento de SLA, uptime de sistemas criticos, seguranca
// e patches, backups, destaques do mes e recomendacoes.

const RAG_OPTIONS = [
  { value: 'green', label: 'No prazo / Sem problemas' },
  { value: 'amber', label: 'Atencao' },
  { value: 'red', label: 'Critico' },
];

const FIELDS = [
  { key: 'tickets_opened', label: 'Chamados abertos', type: 'number', group: 'service_desk' },
  { key: 'tickets_closed', label: 'Chamados encerrados', type: 'number', group: 'service_desk' },
  { key: 'tickets_pending', label: 'Chamados em aberto (final do mes)', type: 'number', group: 'service_desk' },
  { key: 'avg_response_time_hours', label: 'Tempo medio de primeira resposta (horas)', type: 'number', step: '0.1', group: 'service_desk' },
  { key: 'avg_resolution_time_hours', label: 'Tempo medio de resolucao (horas)', type: 'number', step: '0.1', group: 'service_desk' },

  { key: 'sla_response_pct', label: 'SLA de resposta cumprido (%)', type: 'number', step: '0.1', group: 'sla' },
  { key: 'sla_resolution_pct', label: 'SLA de resolucao cumprido (%)', type: 'number', step: '0.1', group: 'sla' },

  { key: 'uptime_servers_pct', label: 'Uptime servidores (%)', type: 'number', step: '0.01', group: 'uptime' },
  { key: 'uptime_network_pct', label: 'Uptime rede/internet (%)', type: 'number', step: '0.01', group: 'uptime' },
  { key: 'uptime_cloud_pct', label: 'Uptime aplicacoes em nuvem (%)', type: 'number', step: '0.01', group: 'uptime' },
  { key: 'uptime_workstations_pct', label: 'Uptime estacoes de trabalho (%)', type: 'number', step: '0.01', group: 'uptime' },

  { key: 'security_incidents', label: 'Incidentes de seguranca identificados', type: 'number', group: 'security' },
  { key: 'security_incidents_resolved', label: 'Incidentes de seguranca resolvidos', type: 'number', group: 'security' },
  { key: 'patches_applied', label: 'Atualizacoes/patches aplicados', type: 'number', group: 'security' },
  { key: 'patches_pending', label: 'Atualizacoes/patches pendentes', type: 'number', group: 'security' },
  { key: 'backup_success_pct', label: 'Backups com sucesso (%)', type: 'number', step: '0.1', group: 'security' },
  { key: 'backup_restore_tested', label: 'Teste de restauracao de backup realizado?', type: 'select', options: ['Sim', 'Nao', 'Nao aplicavel'], group: 'security' },

  { key: 'csat_score', label: 'Satisfacao do cliente / CSAT (0 a 10, opcional)', type: 'number', step: '0.1', group: 'satisfaction' },
];

const GROUPS = [
  { key: 'service_desk', label: 'Desempenho do Service Desk' },
  { key: 'sla', label: 'Cumprimento de SLA' },
  { key: 'uptime', label: 'Disponibilidade (Uptime)' },
  { key: 'security', label: 'Seguranca, Patches e Backups' },
  { key: 'satisfaction', label: 'Satisfacao do Cliente' },
];

const TEXT_FIELDS = [
  { key: 'executive_summary', label: 'Resumo Executivo', placeholder: 'Duas ou tres frases resumindo o mes: principais entregas, saude geral do ambiente e pontos de atencao.' },
  { key: 'highlights', label: 'Destaques e Trabalhos Concluidos', placeholder: 'Projetos entregues, melhorias implementadas, marcos alcancados no mes.' },
  { key: 'recommendations', label: 'Recomendacoes para o Proximo Mes', placeholder: 'Acoes sugeridas, investimentos necessarios, riscos a mitigar.' },
];

const STATUS_AREAS = [
  { key: 'status_service_desk', label: 'Service Desk' },
  { key: 'status_sla', label: 'SLA' },
  { key: 'status_uptime', label: 'Disponibilidade' },
  { key: 'status_security', label: 'Seguranca e Backups' },
];

function suggestStatus(data) {
  const suggestions = {};

  const sla = parseFloat(data.sla_response_pct);
  const slaRes = parseFloat(data.sla_resolution_pct);
  const worstSla = [sla, slaRes].filter((v) => !Number.isNaN(v));
  if (worstSla.length) {
    const min = Math.min(...worstSla);
    suggestions.status_sla = min >= 95 ? 'green' : min >= 85 ? 'amber' : 'red';
  }

  const uptimes = ['uptime_servers_pct', 'uptime_network_pct', 'uptime_cloud_pct', 'uptime_workstations_pct']
    .map((k) => parseFloat(data[k]))
    .filter((v) => !Number.isNaN(v));
  if (uptimes.length) {
    const min = Math.min(...uptimes);
    suggestions.status_uptime = min >= 99.9 ? 'green' : min >= 99 ? 'amber' : 'red';
  }

  const pending = parseFloat(data.tickets_pending);
  if (!Number.isNaN(pending)) {
    suggestions.status_service_desk = pending <= 5 ? 'green' : pending <= 15 ? 'amber' : 'red';
  }

  const incidents = parseFloat(data.security_incidents);
  const backupPct = parseFloat(data.backup_success_pct);
  if (!Number.isNaN(incidents) || !Number.isNaN(backupPct)) {
    if ((incidents || 0) === 0 && (Number.isNaN(backupPct) || backupPct >= 99)) {
      suggestions.status_security = 'green';
    } else if ((incidents || 0) <= 2 && (Number.isNaN(backupPct) || backupPct >= 95)) {
      suggestions.status_security = 'amber';
    } else {
      suggestions.status_security = 'red';
    }
  }

  return suggestions;
}

export { RAG_OPTIONS, FIELDS, GROUPS, TEXT_FIELDS, STATUS_AREAS, suggestStatus };
